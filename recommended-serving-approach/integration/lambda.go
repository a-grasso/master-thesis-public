package integration

import (
	"di-iot-serving/service"
	"github.com/akrylysov/algnhsa"
)

type LambdaHttpIntegration struct {
	Integration // Embedding

	gin GinHttpIntegration // Embedding
}

func (l *LambdaHttpIntegration) Run(blac service.ServingService) {

	server := l.gin.SetupHttpServer(blac)

	algnhsa.ListenAndServe(server, nil)
}
