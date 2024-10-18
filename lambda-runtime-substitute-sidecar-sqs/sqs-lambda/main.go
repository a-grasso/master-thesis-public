package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"log"
)

type DeviceUpdate struct {
	DeviceId string  `json:"device_id"`
	Axis     string  `json:"axis"`
	Value    float64 `json:"value"`
}

type SQSConsumerLambda struct {
}

func (lp *SQSConsumerLambda) Handler(ctx context.Context, sqsEvent events.SQSEvent) error {

	for _, message := range sqsEvent.Records {
		fmt.Printf("The message %s for event source %s = %s \n", message.MessageId, message.EventSource, message.Body)

		data := DeviceUpdate{}
		err := json.Unmarshal([]byte(message.Body), &data)
		if err != nil {
			fmt.Printf("Error unmarshalling data %s", err)
			return err
		}

		log.Println("Processed data : ", data)
	}

	return nil
}

func main() {
	log.Println("Starting Lambda")

	consumer := SQSConsumerLambda{}
	lambda.Start(consumer.Handler)
}
