package config

import (
	"github.com/joho/godotenv"
	"os"
)

type Config struct {
	RedisURL      string
	RedisPassword string
	RedisUseTLS   bool
	Port          string
}

func FetchConfig() Config {
	_ = godotenv.Load()
	config := Config{
		RedisURL:      os.Getenv("REDIS_URL"),
		RedisPassword: os.Getenv("REDIS_PASSWORD"),
		RedisUseTLS:   os.Getenv("REDIS_USE_TLS") == "true",
		Port:          os.Getenv("PORT"),
	}

	return config
}
