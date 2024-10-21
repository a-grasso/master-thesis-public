package integration

import "di-iot-serving/service"

type Integration interface {
	Run(blac service.ServingService)
}
