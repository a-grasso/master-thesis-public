package service

import (
	"di-iot-processing/persistence"
	"fmt"
)

type ProcessingServiceImpl struct {
	ProcessingService // Embedding

	Persistence persistence.Persistence
}

func (p *ProcessingServiceImpl) ProcessData(event DeviceUpdate) {
	fmt.Println(event)

	p.Persistence.StoreInPersistence(event.DeviceId+"-"+event.Axis, event.Value)
	fmt.Println("Processed data")
}
