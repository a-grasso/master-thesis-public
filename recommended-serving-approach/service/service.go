package service

import (
	"di-iot-serving/persistence"
	"fmt"
	"math"
)

type ServingServiceImpl struct {
	ServingService // Embedding

	Persistence persistence.Persistence
}

func (s *ServingServiceImpl) Devices() []string {
	keys := s.Persistence.GetAllKeys()

	// trim "-x", "-y", "-z" from keys, only keep unique devices
	devices := make(map[string]bool)
	for _, key := range keys {
		device := key[:len(key)-2]
		devices[device] = true
	}

	var result []string
	for device := range devices {
		result = append(result, device)
	}

	return result
}

func (s *ServingServiceImpl) VectorLength(device string) (float64, error) {
	fmt.Println("Getting vector length")

	x, y, z := s.fetchDeviceAxes(device)

	return math.Sqrt(x*x + y*y + z*z), nil
}

func (s *ServingServiceImpl) fetchDeviceAxes(device string) (x float64, y float64, z float64) {
	x = s.Persistence.FetchFromPersistence(device + "-x")
	y = s.Persistence.FetchFromPersistence(device + "-y")
	z = s.Persistence.FetchFromPersistence(device + "-z")

	return x, y, z
}
