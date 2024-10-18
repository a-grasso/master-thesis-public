# Lambda Runtime Substitute Sidecar for SQS

In `lrss-sqs` is a Lambda Runtime Substitute Sidecar for SQS. It is a sidecar that can be used to run Lambda functions locally that are triggered by SQS events.
It substitutes the Lambda Runtime API which the Lambda function in `sqs-lambda` uses to get the SQS event for invocation.
The LRSS substitutes the AWS internal event sourcing and is a standalone application that can be run locally to process SQS events.

The `docker-compose.yml` file is configured to run the LRSS sidecar and the Lambda function locally.
A `SQS_URL` environment variable has to be set for the sidecar though!