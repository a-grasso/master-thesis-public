#!/bin/bash

source .env # CR_PAT=...

echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin

docker build -t proxus-lambda-runtime -f layer.Dockerfile .
docker tag proxus-lambda-runtime:latest ghcr.io/a-grasso/proxus-lambda-runtime:latest

docker push ghcr.io/a-grasso/proxus-lambda-runtime:latest