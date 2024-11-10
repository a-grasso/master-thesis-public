package deprec2

import (
	"fmt"
	"github.com/akrylysov/algnhsa"
	"log"
	"net/http"
	"os"
)

type Deprec2 struct {
}

type Config struct {
	Port string
}

func (Deprec2) RunThisShitForMe(router http.Handler, config Config) {

	if lambdaConditional() {
		fmt.Printf("Running in AWS Lambda\n")

		algnhsa.ListenAndServe(router, nil)
	} else {
		fmt.Printf("Running as standalone HTTP server\n")
		url := fmt.Sprintf(":%s", config.Port)
		log.Fatalf(http.ListenAndServe(url, router).Error())
	}
}

func lambdaConditional() bool {
	_, inLambda := os.LookupEnv("AWS_LAMBDA_FUNCTION_NAME")

	return inLambda
}
