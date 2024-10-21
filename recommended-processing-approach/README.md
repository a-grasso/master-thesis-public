# Recommended Processing Approach

This project features a Go application as processing application with the recommended hybrid deployment model of *portable serverless-first*.

The portability is by integration logic branching to fit both deployment variants into the same docker container:
1. Go Lambda triggered by SQS
2. Go standalone application polling SQS

The application checks by itself if it runs within the AWS Lambda execution environment and branches the processing logic accordingly.

One Dockerfile (`Dockerfile`) is provided for both deployment variants.

This processing applications goes hand in hand with the serving application in `./../recommended-serving-approach`.
