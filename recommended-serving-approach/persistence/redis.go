package persistence

import (
	"context"
	"crypto/tls"
	"fmt"
	"github.com/redis/go-redis/v9"
	"strconv"
)

type RedisPersistenceImpl struct {
	Client *redis.Client
	c      context.Context
}

func (r *RedisPersistenceImpl) FetchFromPersistence(key string) float64 {
	fmt.Printf("Fetching key: %s\n", key)
	val, err := r.Client.Get(r.c, key).Result()
	if err != nil {
		panic(err)
	}

	v, err := strconv.ParseFloat(val, 64)
	if err != nil {
		panic(err)
	}
	return v
}

func (r *RedisPersistenceImpl) GetAllKeys() []string {
	var keys []string
	iter := r.Client.Scan(r.c, 0, "*", 0).Iterator()
	for iter.Next(r.c) {
		keys = append(keys, iter.Val())
	}
	if err := iter.Err(); err != nil {
		panic(err)
	}

	return keys
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
	return &RedisPersistenceImpl{Client: rdb, c: context.Background()}
}
