package service

type ServingService interface {
	Devices() []string

	VectorLength(device string) (float64, error)

	ConnectDevice(device, email string) error // links a device with an email for notifications
	AllConnections() map[string]string        // returns all connections

	ConfigureDeviceThreshold(device string, threshold float64) error // sets a threshold for a device
	AllThresholds() map[string]float64                               // returns all thresholds
}
