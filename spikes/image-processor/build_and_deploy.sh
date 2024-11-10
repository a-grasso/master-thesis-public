#/bin/bash

## go native (custom runtime)
rm -rf bootstrap function.zip

GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o bootstrap main.go
zip function.zip bootstrap

aws s3 cp ./function.zip s3://anto-mt-lambda-artifacts/image-processor.zip

aws lambda update-function-code --function-name anto-mt-image-processor --s3-bucket anto-mt-lambda-artifacts --s3-key image-processor.zip 1> /dev/null