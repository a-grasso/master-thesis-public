package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

func handler(ctx context.Context, req *events.LambdaFunctionURLRequest) (int, error) {

	log.Println("Received request")
	b := []byte(req.Body)

	// Perform a compute-intensive task
	content := computeIntensiveTask(b)

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("eu-central-1"),
	},
	)
	if err != nil {
		log.Fatalf("failed to create AWS session, %v", err)
	}

	s3Client := s3.New(sess)
	bucket := aws.String(req.QueryStringParameters["bucket"])
	tsString := fmt.Sprintf("%d", time.Now().Unix())
	key := aws.String(fmt.Sprintf("%s/%s", req.QueryStringParameters["key"], tsString))

	_, err = s3Client.PutObject(&s3.PutObjectInput{
		Bucket: bucket,
		Key:    key,
		Body:   bytes.NewReader(content),
	})

	if err != nil {
		log.Println("failed to put object to S3", err)
		return -1, err
	}

	return len(b), nil
}

func computeIntensiveTask(data []byte) []byte {
	seed := time.Now().UnixNano()
	log.Println("Seed:", seed)
	r := rand.New(rand.NewSource(seed))

	// Generate a random XOR key based on the payload's length
	xorKey := byte(r.Intn(256))

	// Perform a large number of XOR operations and hash iterations
	for i := 0; i < 3333; i++ { // Adjust the loop count for desired computation time
		for j := 0; j < len(data); j++ {
			data[j] ^= xorKey
		}
		hash := sha256.Sum256(data)
		copy(data[:sha256.Size], hash[:sha256.Size]) // Replace part of the data with its hash
	}

	// Encode the result as a hexadecimal string
	encodedBody := make([]byte, hex.EncodedLen(len(data)))
	hex.Encode(encodedBody, data)

	return encodedBody
}

func main() {
	lambda.Start(handler)
}
