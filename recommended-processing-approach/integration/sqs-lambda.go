package integration

import (
	"context"
	"di-iot-processing/service"
	"encoding/json"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
)

type SQSConsumerLambda struct {
	s service.ProcessingService
}

func NewSQSConsumerLambda(s service.ProcessingService) *SQSConsumerLambda {
	return &SQSConsumerLambda{s: s}
}

func (lp *SQSConsumerLambda) Handler(_ context.Context, sqsEvent events.SQSEvent) error {
	for _, message := range sqsEvent.Records {
		fmt.Printf("The message %s for event source %s = %s \n", message.MessageId, message.EventSource, message.Body)

		data := service.DeviceUpdate{}
		err := json.Unmarshal([]byte(message.Body), &data)
		if err != nil {
			fmt.Printf("Error unmarshalling data %s", err)
			return err
		}

		lp.s.ProcessData(data)
	}

	return nil
}
