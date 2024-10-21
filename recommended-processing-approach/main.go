package main

import (
	"di-iot-processing/config"
	"di-iot-processing/integration"
	"di-iot-processing/persistence"
	"di-iot-processing/service"
	"fmt"
	"github.com/aws/aws-lambda-go/lambda"
	"os"
)

func main() {
	_, inLambda := os.LookupEnv("AWS_LAMBDA_FUNCTION_NAME") // auto env flag

	c := config.FetchConfig()
	blac := &service.ProcessingServiceImpl{
		Persistence: persistence.NewRedisPersistenceImpl(c.RedisURL, c.RedisPassword, c.RedisUseTLS),
	}

	if inLambda {
		fmt.Printf("Running in AWS Lambda consuming SQS\n")
		lambda.Start(integration.NewSQSConsumerLambda(blac).Handler)
	} else {
		fmt.Printf("Running as standalone service pulling from SQS\n")
		integration.NewSQSConsumerContainer(blac).Run()
	}
}
