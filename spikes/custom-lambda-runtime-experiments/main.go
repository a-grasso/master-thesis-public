package main

import (
	"context"
	"errors"
	"fmt"
	"go-lambda/adapter"
	otelp "go-lambda/otel"
	"go-lambda/runtime"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"net/http"
	"os"
	"os/signal"
	"time"
)

type Proxus struct {
	tracer        trace.Tracer
	runtimeClient *runtime.Client
	httpClient    *http.Client
	coldstart     bool
	serviceUrl    string
}

func main() {
	// set otel service name
	os.Setenv("OTEL_SERVICE_NAME", "proxus")

	// Handle SIGINT (CTRL+C) gracefully.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Set up OpenTelemetry.
	otelShutdown, err := otelp.SetupOTelSDK(ctx)
	if err != nil {
		return
	}
	// Handle shutdown properly so nothing leaks.
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	AWSLambdaRuntimeAPI := os.Getenv("AWS_LAMBDA_RUNTIME_API")
	// set default to localhost
	if AWSLambdaRuntimeAPI == "" {
		AWSLambdaRuntimeAPI = "localhost:80"
	}

	httpClient := http.Client{Transport: otelhttp.NewTransport(http.DefaultTransport)}
	runtimeClient := runtime.NewLambdaRuntimeAPIClient(AWSLambdaRuntimeAPI, &httpClient)

	InternalServiceURL := "http://localhost:6969"

	proxus := &Proxus{
		coldstart:     true,
		runtimeClient: runtimeClient,
		httpClient:    &httpClient,
		tracer:        otel.Tracer("proxus"),
		serviceUrl:    InternalServiceURL,
	}

	for {
		err := proxus.do()
		if err != nil {
			fmt.Println(err)
		}
	}
}

func (p *Proxus) do() error {
	ctx, span := p.tracer.Start(context.Background(), "proxus-invocation-handling")
	defer span.End()

	eventData, invocationID, err := p.runtimeClient.FetchInvocation(ctx)
	span.SetAttributes(attribute.String("faas.invocation_id", invocationID))
	span.SetAttributes(attribute.Bool("faas.coldstart", p.coldstart))
	p.coldstart = false

	if err != nil {
		err = fmt.Errorf("error fetching invocation from Lambda runtime API: %w", err)
		span.RecordError(err)
		return err
	}

	var ad adapter.Adapter
	ad = adapter.NewLambdaFunctionURLAdapter(p.serviceUrl)

	internalRequest, err := ad.ParseRequest(ctx, eventData)

	if err != nil {
		err = fmt.Errorf("error parsing request: %w", err)
		span.RecordError(err)
		return err
	}

	response, err := p.httpClient.Do(internalRequest)
	if err != nil {
		err = fmt.Errorf("error making request to internal service: %w", err)
		span.RecordError(err)
		return err
	}

	responseData, err := ad.CreateResponse(response)

	err = p.runtimeClient.PublishResult(ctx, invocationID, responseData)
	if err != nil {
		err = fmt.Errorf("error publishing result to Lambda runtime API: %w", err)
		span.RecordError(err)
		return err
	}

	// sleep for 1s, increment for 10s, print still alive
	for i := 1; i <= 10; i++ {
		time.Sleep(1 * time.Second)
		fmt.Println("still alive")
	}

	return nil
}
