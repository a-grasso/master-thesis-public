package main

import (
	"context"
	"errors"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"log"
	"net/http"
	"os"
	"os/signal"
	"service/otel"
)

func main() {
	// set otel service name
	os.Setenv("OTEL_SERVICE_NAME", "service")

	// Handle SIGINT (CTRL+C) gracefully.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Set up OpenTelemetry.
	otelShutdown, err := otel.SetupOTelSDK(ctx)
	if err != nil {
		return
	}
	// Handle shutdown properly so nothing leaks.
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	mux := http.NewServeMux()

	// handleFunc is a replacement for mux.HandleFunc
	// which enriches the handler's HTTP instrumentation with the pattern as the http.route.
	handleFunc := func(pattern string, handlerFunc func(http.ResponseWriter, *http.Request)) {
		// Configure the "http.route" for the HTTP instrumentation.
		handler := otelhttp.WithRouteTag(pattern, http.HandlerFunc(handlerFunc))
		mux.Handle(pattern, handler)
	}

	handleFunc("/get", func(w http.ResponseWriter, r *http.Request) {
		log.Println("GET")
		w.Write([]byte("GET\n"))
	})
	handleFunc("/post", func(w http.ResponseWriter, r *http.Request) {
		log.Println("POST")
		body := make([]byte, r.ContentLength)
		r.Body.Read(body)

		w.Write(body)
	})
	handler := otelhttp.NewHandler(mux, "/")
	port := os.Getenv("PORT")
	if port == "" {
		port = "6969"
	}
	err = http.ListenAndServe(":"+port, handler)
	if err != nil {
		return
	}
}
