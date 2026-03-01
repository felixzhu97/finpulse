package cache

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	BlockchainKeyPrefix       = "blockchain:"
	PortfolioAggregatePrefix  = "portfolio:aggregate:"
	DefaultTTL                = 300
)

type RedisCache struct {
	client *redis.Client
}

func NewRedisCache(client *redis.Client) *RedisCache {
	return &RedisCache{client: client}
}

func (r *RedisCache) Get(ctx context.Context, key string) (interface{}, error) {
	if r.client == nil {
		return nil, nil
	}
	raw, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var v interface{}
	if err := json.Unmarshal([]byte(raw), &v); err != nil {
		return nil, nil
	}
	return v, nil
}

func (r *RedisCache) Set(ctx context.Context, key string, value interface{}, ttlSeconds int) error {
	if r.client == nil {
		return nil
	}
	if ttlSeconds <= 0 {
		ttlSeconds = DefaultTTL
	}
	payload, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.client.Set(ctx, key, payload, time.Duration(ttlSeconds)*time.Second).Err()
}

func (r *RedisCache) Delete(ctx context.Context, keys ...string) error {
	if r.client == nil || len(keys) == 0 {
		return nil
	}
	return r.client.Del(ctx, keys...).Err()
}

func (r *RedisCache) DeleteByPrefix(ctx context.Context, prefix string) error {
	if r.client == nil {
		return nil
	}
	iter := r.client.Scan(ctx, 0, prefix+"*", 100).Iterator()
	var keys []string
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}
	if err := iter.Err(); err != nil {
		return err
	}
	if len(keys) > 0 {
		return r.client.Del(ctx, keys...).Err()
	}
	return nil
}
