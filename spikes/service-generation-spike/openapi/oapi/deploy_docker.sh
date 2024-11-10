#!/bin/bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 754596745400.dkr.ecr.us-east-1.amazonaws.com

### 2in1 (web-standalone/lambda)
docker build --platform linux/amd64 -t oapi-deprec2 -f Dockerfile .
docker tag oapi-deprec2 754596745400.dkr.ecr.us-east-1.amazonaws.com/anto-mt-lambda-images:oapi-deprec2
docker push 754596745400.dkr.ecr.us-east-1.amazonaws.com/anto-mt-lambda-images:oapi-deprec2
