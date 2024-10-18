package main

import (
	"context"
	json2 "encoding/json"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"log"
	"net/http"
	"os"
)

func main() {

	sqsConsumer := NewSQSConsumer()
	queue := os.Getenv("SQS_URL")

	sqsReceivedMessages := make(chan *sqs.ReceiveMessageOutput)
	sqsReceipts := make([]string, 0)

	go func() {
		for {
			message, err := sqsConsumer.ReceiveMessage(context.Background(), queue)
			if err != nil {
				log.Println("Error receiving message: ", err)
				continue
			}
			if message == nil {
				log.Println("No message received yet, continue waiting...")
				continue
			}

			log.Println("Received message: ", *message)
			sqsReceivedMessages <- message
		}
	}()

	http.HandleFunc("/2018-06-01/runtime/invocation/next", func(w http.ResponseWriter, r *http.Request) {
		log.Println("GET /2018-06-01/runtime/invocation/next")

		message := <-sqsReceivedMessages

		var records []events.SQSMessage
		invocationResponse := events.SQSEvent{Records: records}
		for _, msg := range message.Messages {

			jsonMsg, err := json2.Marshal(msg)

			if err != nil {
				log.Println("Error marshalling message: ", err)
				continue
			}

			var sqsMessage events.SQSMessage
			err = json2.Unmarshal(jsonMsg, &sqsMessage)
			if err != nil {
				log.Println("Error unmarshalling message: ", err)
				continue
			}

			sqsReceipts = append(sqsReceipts, sqsMessage.ReceiptHandle)

			records = append(records, sqsMessage)
		}

		invocationResponse.Records = records
		sqsEvent, err := json2.Marshal(invocationResponse)
		if err != nil {
			log.Println("Error marshalling invocationResponse: ", err)
			http.Error(w, "Error marshalling invocationResponse", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Lambda-Runtime-Deadline-Ms", "1000")
		w.Write(sqsEvent)
		fmt.Printf("Returning message: %s\n", sqsEvent)
	})

	http.HandleFunc("/2018-06-01/runtime/invocation/error", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusAccepted)
	})

	http.HandleFunc("/2018-06-01/runtime/invocation/response", func(w http.ResponseWriter, r *http.Request) {
		log.Println("POST /2018-06-01/runtime/invocation/response")

		for _, receipt := range sqsReceipts {
			log.Printf("Deleting message from queue %s: %s", queue, receipt)

			err := sqsConsumer.DeleteMessage(context.Background(), queue, receipt)
			if err != nil {
				log.Println("Error deleting message: ", err)
				continue
			}
		}

		w.WriteHeader(http.StatusAccepted)
	})

	port := os.Getenv("PORT")
	fmt.Printf("Listening on port %s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		panic(err)
	}
}
