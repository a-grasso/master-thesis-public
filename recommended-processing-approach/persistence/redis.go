package persistence

import (
	"context"
	"crypto/tls"
	"fmt"
	"github.com/redis/go-redis/v9"
	"time"
)

type RedisPersistenceImpl struct {
	client *redis.Client
	c      context.Context
}

func (r RedisPersistenceImpl) StoreInPersistence(key string, data float64) {
	err := r.client.Set(r.c, key, data, 30*time.Second).Err()
	if err != nil {
		panic(err)
	}
}

func NewRedisPersistenceImpl(url string, pw string, useTLS bool) *RedisPersistenceImpl {
	fmt.Printf("Connecting to Redis at %s\n", url)
	opt := &redis.Options{
		Addr:     url,
		DB:       0,
		Password: pw,
	}
	if useTLS {
		opt.TLSConfig = &tls.Config{}
	}

	rdb := redis.NewClient(opt)
	c := context.Background()
	val, err := rdb.Ping(c).Result()
	fmt.Println(val, err)
	return &RedisPersistenceImpl{client: rdb, c: context.Background()}
}
