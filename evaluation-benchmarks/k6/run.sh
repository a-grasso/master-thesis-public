#!/bin/bash

lambda_arns=("<gofib-lambda>" "<gofib-lwa>" "<gos3-lwa>" "<gos3-lambda>")

timestamp=$(date +%m-%d_%Hh%Mm%Ss)
context=$1

dir="k6_runs/${timestamp}_${context}"
if [ -z "$context" ]; then
    dir="k6_runs/$timestamp"
fi
mkdir -p $dir

function COLD_START_LAMBDAS() {
    random_value=$(date +%s)
    for lambda_arn in "${lambda_arns[@]}"
    do
        CURRENT_ENV=$(aws lambda get-function-configuration --function-name $lambda_arn | jq '.Environment.Variables')
        NEW_ENV=$(echo $CURRENT_ENV | jq '. += {"COLD_START":"'$random_value'"}')
        aws lambda update-function-configuration --function-name $lambda_arn --environment "{ \"Variables\": $NEW_ENV }"
    done
    sleep $((1 * $sleep_x))
}

function FORCE_ECS_SCALE_DOWN() {
   # Variables
    CLUSTER_NAME="<cluster>"

    # Get a list of all ECS services in the cluster
    SERVICES=$(aws ecs list-services --cluster $CLUSTER_NAME --query "serviceArns[]" --output text)

    TOTAL_UPDATES=0
    # Loop through each service
    for SERVICE_ARN in $SERVICES; do
        # Extract the service name from the ARN
        SERVICE_NAME=$(basename $SERVICE_ARN)

        # Get the current desired task count
        CURRENT_COUNT=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --query "services[0].desiredCount" --output text)

        # Check if the current count is not equal to 1
        if [ "$CURRENT_COUNT" -ne 1 ]; then
            TOTAL_UPDATES=$((TOTAL_UPDATES + 1))
            # Update the service to set the desired task count to 1
            aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --desired-count 1
            echo "Updated desired task count for $SERVICE_NAME to 1."
        else
            echo "Desired task count for $SERVICE_NAME is already 1."
        fi
    done

    if [ "$TOTAL_UPDATES" -gt 0 ]; then
        echo "Sleeping for 10 seconds to allow ECS services to scale down..."
        sleep $((10 * $sleep_x))
    fi
}

function switch_hetzner_service() {
    local service_name=$1
    ssh root@<IP> <<EOF
        docker compose down
        sleep 2
        docker compose up "$service_name" -d
EOF
    echo "Switched Hetzner service to $service_name"
}

function trim_extension() {
    local filename="$1"
    local basename="${filename%.*}"
    echo "$basename"
}

function run_scenarios() {
    local endpoints=("${!1}")
    local scenarios=("${!2}")
    local k6_script="$3"

    echo "Running k6 script: $k6_script"
    echo "Running endpoints: ${endpoints[@]}"
    echo "Running scenarios: ${scenarios[@]}"

    for endpoint in "${endpoints[@]}"; do
        prefix=$(echo $endpoint | cut -c9-14)

        counter=1
        for scenario in "${scenarios[@]}"; do
            type=$(trim_extension $k6_script)
            scenario_dir="$dir/$type/$prefix/$counter-$scenario"
            mkdir -p "$scenario_dir"

            counter=$((counter + 1))
            
            echo "Cold starting all functions..."
            COLD_START_LAMBDAS 1>/dev/null
            echo "Scaling down all containers..."
            FORCE_ECS_SCALE_DOWN 1>/dev/null

            log_file="$scenario_dir/out.log"
            echo "Running '$scenario' scenario for '$endpoint'"

            json_file="$scenario_dir/out.json"
            csv_file="$scenario_dir/out.csv"
            report_file="$scenario_dir/k6-report.html"

            echo "Logging JSON to '$json_file' \nCSV to '$csv_file' and \nHTML report to '$report_file'"

            #out_params="--out json=$json_file --out csv=$csv_file"
            out_params=""
            if [ "$output_influxdb" = true ]; then
                out_params="$out_params -o xk6-influxdb"
            fi

            K6_INFLUXDB_ORGANIZATION="evaluation-benchmarks" \
            K6_INFLUXDB_BUCKET="$influxdb_bucket" \
            K6_INFLUXDB_TOKEN="<TOKEN>" \
            K6_INFLUXDB_ADDR="http://localhost:8086" \
            K6_INFLUXDB_INSECURE=true \
            K6_WEB_DASHBOARD_EXPORT="$report_file" \
            K6_WEB_DASHBOARD=true \
            K6_WEB_DASHBOARD_PERIOD=1s \
            ./k6 run $out_params -e ENDPOINT=$endpoint -e scenario=$scenario "$k6_script" > "$log_file"

            mv summary.json "$scenario_dir/summary.json"

            echo "Sleeping 5 seconds before next scenario..."
            sleep $((5 * $sleep_x))
        done
    done
}

# Parse command line arguments
run_long=false
run_short=false
output_influxdb=false
influxdb_bucket="k6"  # Default bucket
sleep_x=1

for arg in "$@"; do
    case $arg in
        --long|-l)
        run_long=true
        shift
        ;;
        --short|-s)
        run_short=true
        shift
        ;;
        --influxdb)
        output_influxdb=true
        shift
        ;;
        --scaled-bucket)
        influxdb_bucket="k6-scaled"
        shift
        ;;
        --final-bucket)
        influxdb_bucket="k6-final"
        shift
        ;;
        --high-sleep)
        sleep_x=60
        ;;
        *)
        # unknown option
        ;;
    esac
done

echo "--- Running k6 performance tests ---"
echo "Sleep factor: $sleep_x"
echo "Results will be stored in '$dir'"
if [ "$output_influxdb" = true ]; then
    echo "Results will also be stored in InfluxDB bucket: $influxdb_bucket"
fi

echo "--------------------------------"
echo "-                               "
echo "-                               "

if [ "$run_short" = true ]; then
    echo "------ SHORT REQUEST SCOPE -----"

    switch_hetzner_service gofib
    sleep $((1 * $sleep_x))

    GOFIB_LAMBDA="<APPLICATION_ENDPOINT_URL>"
    GOFIB_LWA="<APPLICATION_ENDPOINT_URL>"
    GOFIB_AR="<APPLICATION_ENDPOINT_URL>"
    GOFIB_ECS="<APPLICATION_ENDPOINT_URL>"
    HETZNER_VM="<APPLICATION_ENDPOINT_URL>"

    endpoints_short=( "$GOFIB_ECS" "$HETZNER_VM" "$GOFIB_LAMBDA" "$GOFIB_LWA" "$GOFIB_AR")
    scenarios_short=("final_constant_vu" "final_long_constant_rate" "final_breakpoint" "final_spike")

    run_scenarios endpoints_short[@] scenarios_short[@] "short_requests.js"
fi


if [ "$run_long" = true ]; then
    echo "------ LONG REQUEST SCOPE -----"

    switch_hetzner_service gos3
    sleep $((1 * $sleep_x))

    GOS3_LAMBDA="<APPLICATION_ENDPOINT_URL>"
    GOS3_LWA="<APPLICATION_ENDPOINT_URL>"
    GOS3_AR="<APPLICATION_ENDPOINT_URL>"
    GOS3_ECS="<APPLICATION_ENDPOINT_URL>"
    HETZNER_VM="<APPLICATION_ENDPOINT_URL>"

    endpoints_long=( "$HETZNER_VM" "$GOS3_LAMBDA" "$GOS3_LWA" "$GOS3_AR" )
    scenarios_long=( "final_constant_vu" "final_constant_rate_1_per_second" "final_breakpoint")

    run_scenarios endpoints_long[@] scenarios_long[@] "long_requests.js"
fi
