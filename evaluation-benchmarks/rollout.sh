#!/bin/bash

ZIP_FLAG=false

# Check if --zip flag is passed
for arg in "$@"; do
    if [ "$arg" == "--zip" ]; then
        ZIP_FLAG=true
    fi
done

if [ "$ZIP_FLAG" = true ]; then
  echo "Zipping the lambda functions"

  pushd gofib-lambda

  rm -rf gofib.zip bootstrap

  GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o bootstrap .
  zip gofib.zip bootstrap

  popd

  pushd gos3-lambda

  rm -rf gos3.zip bootstrap

  GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o bootstrap .
  zip gos3.zip bootstrap

  popd
fi

pushd pulumi
pulumi up --yes
popd