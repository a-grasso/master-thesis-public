import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Resource } from "@pulumi/aws/apigateway";

const n = (name: string) => `${name}`;

const gofibRole = new aws.iam.Role(n("gofib-lambdaRole"), {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: 'lambda.amazonaws.com' }),
});

const gofibPolicy = new aws.iam.RolePolicyAttachment(n('gofib-lambdaRolePolicyAttachment'), {
    role: gofibRole,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});

const gofib = new aws.lambda.Function(n("gofib"), {
    name: n("gofib"),
    timeout: 300,
    runtime: aws.lambda.Runtime.CustomAL2023,
    role: gofibRole.arn,
    handler: 'bootstrap',
    code: new pulumi.asset.AssetArchive({
        '.': new pulumi.asset.FileArchive('./../gofib-lambda/gofib.zip'), // Your path to the directory with lambdaHandler code
    }),
    memorySize: 1769,
});

const gofibFunctionUrl = new aws.lambda.FunctionUrl(n('gofib_url'), {
    functionName: gofib.name,
    authorizationType: 'NONE',
});

export const gofibEndpoint = gofibFunctionUrl.functionUrl;


//////////////////////////////////////////////////////////////////

const ecr = new aws.ecr.Repository(n("ecr"), {
    name: n("ecr"),
    imageScanningConfiguration: {
        scanOnPush: false,
    },
    forceDelete: true,
    imageTagMutability: 'MUTABLE',
});

const gofibLWAImage = new awsx.ecr.Image(n("gofib-lwa"), {
    platform: "linux/amd64",
    imageName: n("gofib-lwa"),
    repositoryUrl: ecr.repositoryUrl,
    dockerfile: `./../gofib-lwa/Dockerfile`,
    context: `./../gofib-lwa`,
});

const gofibLWARole = new aws.iam.Role(n("gofibLWA-lambdaRole"), {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: 'lambda.amazonaws.com' }),
});

const gofibLWAPolicy = new aws.iam.RolePolicyAttachment(n('gofibLWA-lambdaRolePolicyAttachment'), {
    role: gofibLWARole,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});

const gofibLWA = new aws.lambda.Function(n("gofibLWA"), {
    name: n("gofibLWA"),
    timeout: 300,
    packageType: 'Image',
    imageUri: gofibLWAImage.imageUri,
    role: gofibLWARole.arn,
    memorySize: 1769,
    environment: {
        variables: {
            OTEL_SERVICE_NAME: "gofib-lwa-function",
            OTEL_EXPORTER_OTLP_ENDPOINT: "https://otlp-gateway-prod-eu-west-2.grafana.net/otlp",
            OTEL_EXPORTER_OTLP_HEADERS: "Authorization=Basic TODO",
            OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf"
        },
    },
});

const gofibLWAFunctionUrl = new aws.lambda.FunctionUrl(n('gofibLWA_url'), {
    functionName: gofibLWA.name,
    authorizationType: 'NONE',
});

export const gofibLWAEndpoint = gofibLWAFunctionUrl.functionUrl;

//////////////////////////////////////////////////////////////////

const apigw = new aws.apigatewayv2.Api(n("httpApiGateway"), {
    name: n("httpApi-gateway"),
    protocolType: "HTTP",
});

const gofibLambdaPermission = new aws.lambda.Permission(n("gofibLambdaPermission"), {
    action: "lambda:InvokeFunction",
    principal: "apigateway.amazonaws.com",
    function: gofib,
    sourceArn: pulumi.interpolate`${apigw.executionArn}/*/*`,
}, { dependsOn: [apigw, gofib] });

const gofibLWALambdaPermission = new aws.lambda.Permission(n("gofibLWALambdaPermission"), {
    action: "lambda:InvokeFunction",
    principal: "apigateway.amazonaws.com",
    function: gofibLWA,
    sourceArn: pulumi.interpolate`${apigw.executionArn}/*/*`,
}, { dependsOn: [apigw, gofibLWA] });

const gofibIntegration = new aws.apigatewayv2.Integration(n("gofibIntegration"), {
    apiId: apigw.id,
    integrationType: "AWS_PROXY",
    integrationUri: gofib.arn,
    integrationMethod: "POST",
    payloadFormatVersion: "2.0",
    passthroughBehavior: "WHEN_NO_MATCH",
});


const gofibLWAIntegration = new aws.apigatewayv2.Integration(n("gofibLWAIntegration"), {
    apiId: apigw.id,
    integrationType: "AWS_PROXY",
    integrationUri: gofibLWA.arn,
    integrationMethod: "POST",
    payloadFormatVersion: "2.0",
    passthroughBehavior: "WHEN_NO_MATCH",
});

const gofibRoute = new aws.apigatewayv2.Route(n("gofibApiRoute"), {
    apiId: apigw.id,
    routeKey: "POST /gofib",
    target: pulumi.interpolate`integrations/${gofibIntegration.id}`,
});

const gofibLWARoute = new aws.apigatewayv2.Route("gofibLWAApiRoute", {
    apiId: apigw.id,
    routeKey: "POST /gofiblwa",
    target: pulumi.interpolate`integrations/${gofibLWAIntegration.id}`,
});

const stage = new aws.apigatewayv2.Stage("apiStage", {
    apiId: apigw.id,
    name: pulumi.getStack(),
    routeSettings: [
        {
            routeKey: gofibRoute.routeKey,
            throttlingBurstLimit: 5000,
            throttlingRateLimit: 10000,
        },
        {
            routeKey: gofibLWARoute.routeKey,
            throttlingBurstLimit: 5000,
            throttlingRateLimit: 10000,
        }
    ],
    autoDeploy: true,
}, { dependsOn: [gofibRoute, gofibLWARoute] });

export const apigwEndpoint = pulumi.interpolate`${apigw.apiEndpoint}/${stage.name}`;

//////////////////////////////////////////////////////////////////

const ecrAccessRole = new aws.iam.Role(n("ecrAccessRole"), {
    assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
            Effect: 'Allow',
            Principal: {
                Service: 'build.apprunner.amazonaws.com',
            },
            Action: 'sts:AssumeRole',
        }],
    }),
});

const ecrPullPolicyAttachment = new aws.iam.PolicyAttachment(n("ecrPullPolicyAttachment"), {
    policyArn: aws.iam.ManagedPolicy.AWSAppRunnerServicePolicyForECRAccess,
    roles: [ecrAccessRole],
});

const gofibASC = new aws.apprunner.AutoScalingConfigurationVersion("dp-gofibARScaling", {
    autoScalingConfigurationName: "dp-gofibARScaling",
    maxConcurrency: 200,
    maxSize: 25,
    minSize: 1,
});

const gofibService = new aws.apprunner.Service(n("gofib-service"), {
    serviceName: n("gofib-service"),
    healthCheckConfiguration: {
        protocol: "TCP",
    },
    instanceConfiguration: {
        cpu: "1024",
        memory: "2048",
    },
    autoScalingConfigurationArn: gofibASC.arn,
    sourceConfiguration: {
        authenticationConfiguration: {
            accessRoleArn: ecrAccessRole.arn,
        },
        imageRepository: {
            imageIdentifier: gofibLWAImage.imageUri,
            imageRepositoryType: 'ECR',
            imageConfiguration: {
                port: "8080",
                runtimeEnvironmentVariables: {
                    PORT: "8080",
                    OTEL_SERVICE_NAME: "gofib-lwa-service",
                    OTEL_EXPORTER_OTLP_ENDPOINT: "https://otlp-gateway-prod-eu-west-2.grafana.net/otlp",
                    OTEL_EXPORTER_OTLP_HEADERS: "Authorization=Basic TODO",
                    OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf"
                },
                runtimeEnvironmentSecrets: {},
                startCommand: "",
            },
        },
    },
    networkConfiguration: {
        egressConfiguration: {
            egressType: "DEFAULT",
        },
        ingressConfiguration: {
            isPubliclyAccessible: true,
        },
        ipAddressType: "IPV4",
    },
});

export const gofibServiceEndpoint = gofibService.serviceUrl;


//////////////////////////////////////////////////////////////////
const s3Bucket = new aws.s3.Bucket(n("gos3-Bucket"), {
    bucket: n("gos3"),
    acl: 'private',
    forceDestroy: true,
});

const gos3Role = new aws.iam.Role(n("gos3-lambdaRole"), {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: 'lambda.amazonaws.com' }),
});

const gos3ExecutionPolicy = new aws.iam.RolePolicyAttachment(n('gos3-lambdaRolePolicyAttachment'), {
    role: gos3Role,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,

});

const gos3S3Policy = new aws.iam.RolePolicyAttachment(n('gos3-lambdaRoleS3PolicyAttachment'), {
    role: gos3Role,
    policyArn: aws.iam.ManagedPolicy.AmazonS3FullAccess,
});

const gos3 = new aws.lambda.Function(n("gos3"), {
    name: n("gos3"),
    timeout: 300,
    runtime: aws.lambda.Runtime.CustomAL2023,
    role: gos3Role.arn,
    handler: 'bootstrap',
    code: new pulumi.asset.AssetArchive({
        '.': new pulumi.asset.FileArchive('./../gos3-lambda/gos3.zip'),
    }),
    memorySize: 1769,
});

const gos3FunctionUrl = new aws.lambda.FunctionUrl(n('gos3_url'), {
    functionName: gos3.name,
    authorizationType: 'NONE',
});

export const gos3Endpoint = gos3FunctionUrl.functionUrl;


//////////////////////////////////////////////////////////////////

const gos3User = new aws.iam.User(n("gos3User"), {
    name: n("gos3User"),
    path: "/system/",
    forceDestroy: true,
});

const gos3UserS3PolicyAttachment = new aws.iam.UserPolicyAttachment(n('gos3UserS3Policy'), {
    user: gos3User.name,
    policyArn: aws.iam.ManagedPolicies.AmazonS3FullAccess,
});

const accessKey = new aws.iam.AccessKey(n("gos3AccessKey"), {
    user: gos3User.name,
});

const gos3LWAImage = new awsx.ecr.Image(n("gos3-lwa"), {
    platform: "linux/amd64",
    imageName: n("gos3-lwa"),
    repositoryUrl: ecr.repositoryUrl,
    dockerfile: `./../gos3-lwa/Dockerfile`,
    context: `./../gos3-lwa`,
});

const gos3LWARole = new aws.iam.Role(n("gos3LWA-lambdaRole"), {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: 'lambda.amazonaws.com' }),
});

const gos3LWAPolicy = new aws.iam.RolePolicyAttachment(n('gos3LWA-lambdaRolePolicyAttachment'), {
    role: gos3LWARole,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});
const gos3LWAPolicyS3 = new aws.iam.RolePolicyAttachment(n('gos3LWA-lambdaRolePolicyAttachmentS3'), {
    role: gos3LWARole,
    policyArn: aws.iam.ManagedPolicy.AmazonS3FullAccess,
});

const gos3LWA = new aws.lambda.Function(n("gos3LWA"), {
    name: n("gos3LWA"),
    timeout: 300,
    packageType: 'Image',
    imageUri: gos3LWAImage.imageUri,
    role: gos3LWARole.arn,
    memorySize: 1769,
    environment: {
        variables: {
            OTEL_SERVICE_NAME: "gos3-lwa-function",
            OTEL_EXPORTER_OTLP_ENDPOINT: "https://otlp-gateway-prod-eu-west-2.grafana.net/otlp",
            OTEL_EXPORTER_OTLP_HEADERS: "Authorization=Basic TODO",
            OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf"
        },
    },
});

const gos3LWAFunctionUrl = new aws.lambda.FunctionUrl(n('gos3LWA_url'), {
    functionName: gos3LWA.name,
    authorizationType: 'NONE',
});

export const gos3LWAEndpoint = gos3LWAFunctionUrl.functionUrl;

//////////////////////////////////////////////////////////////////

const gos3ASC = new aws.apprunner.AutoScalingConfigurationVersion("dp-gos3ARScaling", {
    autoScalingConfigurationName: "dp-gos3ARScaling",
    maxConcurrency: 3,
    maxSize: 25,
    minSize: 1,
});

const gos3Service = new aws.apprunner.Service(n("gos3-service"), {
    serviceName: n("gos3-service"),
    healthCheckConfiguration: {
        protocol: "TCP",
    },
    instanceConfiguration: {
        cpu: "4096",
        memory: "8192",
    },
    autoScalingConfigurationArn: gos3ASC.arn,
    sourceConfiguration: {
        authenticationConfiguration: {
            accessRoleArn: ecrAccessRole.arn,
        },
        imageRepository: {
            imageIdentifier: gos3LWAImage.imageUri,
            imageRepositoryType: 'ECR',
            imageConfiguration: {
                port: "8080",
                runtimeEnvironmentVariables: {
                    AWS_ACCESS_KEY_ID: accessKey.id,
                    AWS_SECRET_ACCESS_KEY: accessKey.secret,
                    PORT: "8080",
                    OTEL_SERVICE_NAME: "gos3-lwa-service",
                    OTEL_EXPORTER_OTLP_ENDPOINT: "https://otlp-gateway-prod-eu-west-2.grafana.net/otlp",
                    OTEL_EXPORTER_OTLP_HEADERS: "Authorization=Basic TODO",
                    OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf"
                },
                runtimeEnvironmentSecrets: {},
                startCommand: "",
            },
        },
    },
    networkConfiguration: {
        egressConfiguration: {
            egressType: "DEFAULT",
        },
        ingressConfiguration: {
            isPubliclyAccessible: true,
        },
        ipAddressType: "IPV4",
    },
});

export const gos3ServiceEndpoint = gos3Service.serviceUrl;


//////////////////////////////////////////////////////////////////

const ecsCluster = new aws.ecs.Cluster(n("cluster"), {
    name: n("cluster"),
});

const gofibLB = new awsx.lb.ApplicationLoadBalancer("dp-gofib-ecs-lb", { name: "dp-gofib-ecs-lb" });


const gofibECS = new awsx.ecs.FargateService(n("gofib"), {
    cluster: ecsCluster.arn,
    name: n("gofib"),
    assignPublicIp: true,
    taskDefinitionArgs: {
        container: {
            name: n("gofib"),
            image: gofibLWAImage.imageUri,
            cpu: 1024,
            memory: 2048,
            essential: true,
            environment: [{
                name: "PORT",
                value: "80"
            },
            {
                name: "OTEL_SERVICE_NAME",
                value: "gofib-ecs-service",
            },
            {
                name: "OTEL_EXPORTER_OTLP_ENDPOINT",
                value: "https://otlp-gateway-prod-eu-west-2.grafana.net/otlp",
            },
            {
                name: "OTEL_EXPORTER_OTLP_HEADERS",
                value: "Authorization=Basic TODO",
            },
            {
                name: "OTEL_EXPORTER_OTLP_PROTOCOL",
                value: "http/protobuf",
            }],
            portMappings: [{
                containerPort: 80,
                hostPort: 80,
                targetGroup: gofibLB.defaultTargetGroup,
            }],
        },
        cpu: "1024",
        memory: "2048",
    },
});

const gofibScalableTarget = new aws.appautoscaling.Target(n("gofib-autoscaling-target"), {
    resourceId: pulumi.interpolate`service/${ecsCluster.name}/${gofibECS.service.name}`,
    serviceNamespace: "ecs",
    scalableDimension: "ecs:service:DesiredCount",
    minCapacity: 1, // Minimum number of tasks
    maxCapacity: 10, // Maximum number of tasks
});

new aws.appautoscaling.Policy(n("gofib-autoscaling-alb"), {
    name: n("gofib-autoscaling-alb"),
    policyType: "TargetTrackingScaling",
    resourceId: gofibScalableTarget.resourceId,
    scalableDimension: gofibScalableTarget.scalableDimension,
    serviceNamespace: gofibScalableTarget.serviceNamespace,
    targetTrackingScalingPolicyConfiguration: {
        targetValue: 200, // Target request count per target group
        predefinedMetricSpecification: {
            resourceLabel: pulumi.interpolate`${gofibLB.loadBalancer.arnSuffix}/${gofibLB.defaultTargetGroup.arnSuffix}`,
            // ALB request count metric
            predefinedMetricType: "ALBRequestCountPerTarget",
        }
    },
});

export const gofibECSUrl = pulumi.interpolate`http://${gofibLB.loadBalancer.dnsName}`;

//////////////////////////////////////////////////////////////////

const gos3LB = new awsx.lb.ApplicationLoadBalancer("dp-gos3-ecs-lb", { name: "dp-gos3-ecs-lb" });

const gos3EcsTaskRole = new aws.iam.Role(n("gos3EcsTaskRole"), {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: 'ecs-tasks.amazonaws.com' }),
    name: n("gos3EcsTaskRole"),
});

const gos3EcsTaskRolePolicyAttachment = new aws.iam.RolePolicyAttachment(n('gos3EcsTaskRolePolicyAttachment'), {
    role: gos3EcsTaskRole,
    policyArn: aws.iam.ManagedPolicy.AmazonS3FullAccess,
});


// Define the service and configure it to use our image and load balancer.
const gos3Ecs = new awsx.ecs.FargateService(n("gos3"), {
    cluster: ecsCluster.arn,
    name: n("gos3"),
    desiredCount: 1,
    assignPublicIp: true,
    taskDefinitionArgs: {
        taskRole: {
            roleArn: gos3EcsTaskRole.arn,
        },
        container: {
            name: n("gos3"),
            image: gos3LWAImage.imageUri,
            cpu: 4096,
            memory: 8192,
            essential: true,
            environment: [{
                name: "PORT",
                value: "80"
            },
            {
                name: "OTEL_SERVICE_NAME",
                value: "gos3-ecs-service",
            },
            {
                name: "OTEL_EXPORTER_OTLP_ENDPOINT",
                value: "https://otlp-gateway-prod-eu-west-2.grafana.net/otlp",
            },
            {
                name: "OTEL_EXPORTER_OTLP_HEADERS",
                value: "Authorization=Basic TODO",
            },
            {
                name: "OTEL_EXPORTER_OTLP_PROTOCOL",
                value: "http/protobuf",
            }],
            portMappings: [{
                containerPort: 80,
                hostPort: 80,
                targetGroup: gos3LB.defaultTargetGroup,
            }],
        },
        cpu: "4096",
        memory: "8192",
    },
});


const gos3ScalableTarget = new aws.appautoscaling.Target(n("gos3-autoscaling-target"), {
    resourceId: pulumi.interpolate`service/${ecsCluster.name}/${gos3Ecs.service.name}`,
    serviceNamespace: "ecs",
    scalableDimension: "ecs:service:DesiredCount",
    minCapacity: 1, // Minimum number of tasks
    maxCapacity: 10, // Maximum number of tasks
});

const gos3ScalingPolicy = new aws.appautoscaling.Policy(n("gos3-autoscaling-cpu"), {
    name: n("gos3-autoscaling-cpu"),
    policyType: "TargetTrackingScaling",
    resourceId: gos3ScalableTarget.resourceId,
    scalableDimension: gos3ScalableTarget.scalableDimension,
    serviceNamespace: gos3ScalableTarget.serviceNamespace,
    targetTrackingScalingPolicyConfiguration: {
        targetValue: 80.0, // Target task CPU utilization (70% in this case)
        predefinedMetricSpecification: {
            // ECS tasks metric
            predefinedMetricType: "ECSServiceAverageCPUUtilization",
        }
    },
});

// Export the URL so we can easily access it.
export const gos3ECSUrl = pulumi.interpolate`http://${gos3LB.loadBalancer.dnsName}`;
