package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"io"
	"math/rand"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"

	"log"
	"net/http"
	"os"

	"github.com/NicolasBissig/gotel"
	"github.com/NicolasBissig/gotel/gotelhttp"
)

var (
	tracer = otel.Tracer("gos3-tracer")
)

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
	gotelhttp.HandleFunc("/", handler)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Starting server on port", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func init() {
	_, err := gotel.Setup()
	if err != nil {
		log.Fatalf("failed to setup gotel: %v", err)
	}
}

func handler(writer http.ResponseWriter, request *http.Request) {
	ctx, span := tracer.Start(request.Context(), "gos3-handler")
	defer span.End()

	if request.Method == http.MethodGet {
		writer.WriteHeader(http.StatusOK)
		return
	}

	log.Println("Received request", request)
	params := request.URL.Query()
	if len(params) == 0 {
		writer.WriteHeader(http.StatusBadRequest)
		_, _ = writer.Write([]byte("missing bucket and key"))
		return
	}

	k6Scenario := request.Header.Get("X-K6-Scenario")

	span.SetAttributes(attribute.String("k6.scenario", k6Scenario))

	b, err := io.ReadAll(request.Body)
	if err != nil {
		log.Println("failed to read request body", err)
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	// store in s3
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("eu-central-1"),
	},
	)
	if err != nil {
		log.Fatalf("failed to create AWS session, %v", err)
	}

	_, functionSpan := tracer.Start(ctx, "computeIntensiveTask")
	content := computeIntensiveTask(b)
	functionSpan.End()

	s3Client := s3.New(sess)

	bucket := aws.String(request.URL.Query().Get("bucket"))
	tsString := fmt.Sprintf("%d", time.Now().Unix())
	key := aws.String(fmt.Sprintf("%s/%s", request.URL.Query().Get("key"), tsString))

	_, s3Span := tracer.Start(ctx, "saveS3")
	_, err = s3Client.PutObject(&s3.PutObjectInput{
		Bucket: bucket,
		Key:    key,
		Body:   bytes.NewReader(content),
	})
	s3Span.End()

	if err != nil {
		log.Println("failed to put object to S3", err)
		writer.WriteHeader(http.StatusInternalServerError)
		_, _ = writer.Write([]byte(err.Error()))
	}

	writer.WriteHeader(http.StatusOK)
	_, _ = writer.Write([]byte(fmt.Sprintf("%d", len(b))))
}
