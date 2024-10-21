package service

type ProcessingService interface {
	ProcessData(DeviceUpdate)
}

type DeviceUpdate struct {
	DeviceId string  `json:"device_id"`
	Axis     string  `json:"axis"`
	Value    float64 `json:"value"`
}
