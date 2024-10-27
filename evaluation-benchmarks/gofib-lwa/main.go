package main

import (
	"encoding/json"
	"fmt"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"io"

	"log"
	"net/http"
	"os"

	"github.com/NicolasBissig/gotel"
	"github.com/NicolasBissig/gotel/gotelhttp"
)

var (
	tracer = otel.Tracer("gofib-tracer")
)

type Task struct {
	Value int `json:"value"`
}

// fibonacci function
func fibonacci(n int) int {

	if n <= 1 {
		return n
	}
	return fibonacci(n-1) + fibonacci(n-2)
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
	ctx, span := tracer.Start(request.Context(), "gofib-handler")
	defer span.End()

	if request.URL.Path == "/" && request.Method == http.MethodGet {
		writer.WriteHeader(http.StatusOK)
		return
	}

	k6Scenario := request.Header.Get("X-K6-Scenario")

	span.SetAttributes(attribute.String("k6.scenario", k6Scenario))

	log.Println("Received request", request)

	task := Task{}
	b, err := io.ReadAll(request.Body)
	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		_, _ = writer.Write([]byte("-1"))
		return
	}
	err = json.Unmarshal(b, &task)
	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		_, _ = writer.Write([]byte("-1"))
		return
	}

	log.Println("Calculating fibonacci for", task.Value)

	_, functionSpan := tracer.Start(ctx, "fibonacci")
	r := fibonacci(task.Value)
	functionSpan.End()

	writer.WriteHeader(http.StatusOK)
	_, _ = writer.Write([]byte(fmt.Sprintf("%d", r)))
}
