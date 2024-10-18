package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"log"
)

const (
	visibilityTimeout = 60 * 10
	waitingTimeout    = 20
)

type SQSConsumer struct {
	sqsSvc *sqs.Client
}

func NewSQSConsumer() *SQSConsumer {
	log.Println("Use container role")
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		log.Fatalf("error loading config %v", err)
	}

	sqsSvc := sqs.NewFromConfig(cfg)

	return &SQSConsumer{sqsSvc: sqsSvc}
}

func (c *SQSConsumer) ReceiveMessage(ctx context.Context, queueUrl string) (*sqs.ReceiveMessageOutput, error) {
	input := &sqs.ReceiveMessageInput{
		QueueUrl:            &queueUrl,
		MaxNumberOfMessages: 1,
		VisibilityTimeout:   visibilityTimeout,
		WaitTimeSeconds:     waitingTimeout, // use long polling
	}

	resp, err := c.sqsSvc.ReceiveMessage(ctx, input)

	if err != nil {
		return nil, fmt.Errorf("error receiving message %w", err)
	}

	if len(resp.Messages) == 0 {
		return nil, nil
	}

	return resp, nil
}

func (c *SQSConsumer) DeleteMessage(ctx context.Context, queueUrl string, receiptHandle string) error {

	input := &sqs.DeleteMessageInput{
		QueueUrl:      &queueUrl,
		ReceiptHandle: &receiptHandle,
	}

	_, err := c.sqsSvc.DeleteMessage(ctx, input)

	if err != nil {
		return fmt.Errorf("error deleting message %w", err)
	}

	return nil
}
