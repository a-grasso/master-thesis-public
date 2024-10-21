package integration

import (
	"context"
	"di-iot-processing/service"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"log"
	"os"
	"os/signal"
	"syscall"
)

const (
	visibilityTimeout = 60 * 10
	waitingTimeout    = 20
)

type SQSConsumerContainer struct {
	sqsSvc *sqs.Client

	s service.ProcessingService
}

func NewSQSConsumerContainer(s service.ProcessingService) *SQSConsumerContainer {
	log.Println("Use container role")
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		log.Fatalf("error loading config %v", err)
	}

	sqsSvc := sqs.NewFromConfig(cfg)

	return &SQSConsumerContainer{s: s, sqsSvc: sqsSvc}
}

func (lp *SQSConsumerContainer) Process(ctx context.Context, queueUrl string) error {
	input := &sqs.ReceiveMessageInput{
		QueueUrl:            &queueUrl,
		MaxNumberOfMessages: 1,
		VisibilityTimeout:   visibilityTimeout,
		WaitTimeSeconds:     waitingTimeout, // use long polling
	}

	resp, err := lp.sqsSvc.ReceiveMessage(ctx, input)

	if err != nil {
		return fmt.Errorf("error receiving message %w", err)
	}

	log.Printf("received messages: %v", len(resp.Messages))
	if len(resp.Messages) == 0 {
		return nil
	}

	for _, msg := range resp.Messages {
		var deviceUpdate service.DeviceUpdate
		id := *msg.MessageId

		err := json.Unmarshal([]byte(*msg.Body), &deviceUpdate)
		if err != nil {
			return fmt.Errorf("error unmarshalling %w", err)
		}

		log.Printf("message id %s is received from SQS: %#v", id, deviceUpdate)

		lp.s.ProcessData(deviceUpdate)

		_, err = lp.sqsSvc.DeleteMessage(ctx, &sqs.DeleteMessageInput{
			QueueUrl:      &queueUrl,
			ReceiptHandle: msg.ReceiptHandle,
		})

		if err != nil {
			return fmt.Errorf("error deleting message from SQS %w", err)
		}
		log.Printf("message id %s is deleted from queue", id)

	}
	return nil
}

func (lp *SQSConsumerContainer) Run() {
	ctx, cancel := context.WithCancel(context.Background())

	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)

	queueUrl := os.Getenv("SQS_URL")
	log.Printf("SQS_URL: %s", queueUrl)

	defer func() {
		signal.Stop(signalChan)
		cancel()
	}()

loop:
	for {
		select {
		case <-signalChan: //if get SIGTERM
			log.Println("Got SIGTERM signal, cancelling the context")
			cancel() //cancel context

		default:
			err := lp.Process(ctx, queueUrl)

			if err != nil {
				if errors.Is(err, context.Canceled) {
					log.Printf("stop processing, context is cancelled %v", err)
					break loop
				}

				log.Fatalf("error processing SQS %v", err)
			}
		}
	}
	log.Fatalf("service is safely stopped")
}
