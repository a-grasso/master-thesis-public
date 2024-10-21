package main

import (
	"di-iot-serving/config"
	"di-iot-serving/integration"
	"di-iot-serving/persistence"
	"di-iot-serving/service"
	"fmt"
	"os"
)

func main() {

	cfg := config.FetchConfig()

	redis := persistence.NewRedisPersistenceImpl(cfg.RedisURL, cfg.RedisPassword, cfg.RedisUseTLS)
	defer redis.Client.Close()

	blac := &service.ServingServiceImpl{
		Persistence: redis,
	}

	integrate(cfg).Run(blac)
}

func integrate(cfg config.Config) integration.Integration {
	var exec integration.Integration

	_, inLambda := os.LookupEnv("AWS_LAMBDA_FUNCTION_NAME")
	_, standalone := os.LookupEnv("RUN_STANDALONE")

	if inLambda && !standalone {
		fmt.Printf("Running in AWS Lambda\n")
		exec = &integration.LambdaHttpIntegration{}
	} else {
		fmt.Printf("Running as standalone HTTP server\n")
		exec = &integration.GinHttpIntegration{Port: cfg.Port}
	}

	return exec
}
