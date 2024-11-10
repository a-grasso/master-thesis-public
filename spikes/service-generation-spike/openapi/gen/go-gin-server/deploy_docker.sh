#!/bin/bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 754596745400.dkr.ecr.us-east-1.amazonaws.com

### 2in1 (web-standalone/lambda)
docker build --platform linux/amd64 -t hybrid-petstore -f hybrid.Dockerfile .
docker tag hybrid-petstore 754596745400.dkr.ecr.us-east-1.amazonaws.com/anto-mt-lambda-images:hybrid-petstore
docker push 754596745400.dkr.ecr.us-east-1.amazonaws.com/anto-mt-lambda-images:hybrid-petstore
