package main

import (
	"fmt"
	sw "github.com/GIT_USER_ID/GIT_REPO_ID/go"
	"github.com/akrylysov/algnhsa"
	"log"

	"os"
)

func main() {
	_, inLambda := os.LookupEnv("AWS_LAMBDA_FUNCTION_NAME")

	routes := sw.ApiHandleFunctions{}

	log.Printf("Server started")

	useCases := sw.NewRouter(routes)

	if inLambda {
		fmt.Printf("Running in AWS Lambda\n")
		algnhsa.ListenAndServe(useCases, nil)
	} else {
		fmt.Printf("Running as standalone HTTP server\n")
		err := useCases.Run()
		if err != nil {
			return
		}
	}
}
