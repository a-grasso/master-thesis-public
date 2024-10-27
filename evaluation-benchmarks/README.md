# Evaluation Benchmarks

This directory features the Fibonacci and File services for the evaluation benchmarks.

Directories are structured as follows:

- `gofib-lambda`: Contains the native Lambda fibonacci application
- `gofib-lwa`: Contains the fibonacci application with the recommended hybrid deployment approach of *adapted serverful-first* using the Lambda Web Adapter as adaptation for deploying the application on AWS Lambda
- `gos3-lambda`: Contains the native Lambda file service application
- `gos3-lwa`: Contains the file service application with the recommended hybrid deployment approach of *adapted serverful-first* using the Lambda Web Adapter as adaptation for deploying the application on AWS Lambda
- `hetzner-vm`: Contains the docker compose files to deploy both the applications - gofib-lwa and gos3-lwa on a Hetzner VM
- `pulumi` : Contains the pulumi code to provision infrastructure on AWS required for the evaluation benchmarks: for instance the Lambdas, ECS clusters, AppRunners and S3 Buckets

The services are built and infrastructure is provisioned using the `rollout.sh` script.
Deployment to the HetznerVM was done manually.
