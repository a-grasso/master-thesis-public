package main

import (
	"context"
	"encoding/json"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"log"
)

type Task struct {
	Value int `json:"value"`
}

func handler(ctx context.Context, req *events.LambdaFunctionURLRequest) (int, error) {

	log.Println("Received request", req)
	task := Task{}
	err := json.Unmarshal([]byte(req.Body), &task)
	if err != nil {
		return -1, err
	}

	log.Println("Calculating fibonacci for", task.Value)
	r := fibonacci(task.Value)
	return r, nil
}

// fibonacci function
func fibonacci(n int) int {

	if n <= 1 {
		return n
	}
	return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
	lambda.Start(handler)
}
