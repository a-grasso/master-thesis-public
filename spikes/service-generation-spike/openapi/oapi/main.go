package main

import (
	"oapi-test/api"
	"oapi-test/deprec2"
)

func main() {
	// make redis connection
	service := api.Service{
		// redis: redis.NewClient(&redis.Options{}),
	}

	handler := api.NewStrictHandler(service, nil)
	router := api.Handler(handler)

	deprec2.Deprec2{}.RunThisShitForMe(router, deprec2.Config{Port: "8080"})
}
