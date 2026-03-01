package cache

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"

	"finpulse/server-go/internal/domain"
)

const (
	QuotesKeyPrefix   = "quotes:"
	QuotesTTLSeconds  = 60
)

type QuoteCache struct {
	client *redis.Client
}

func NewQuoteCache(client *redis.Client) *QuoteCache {
	return &QuoteCache{client: client}
}

type quoteEntry struct {
	Price      float64 `json:"price"`
	Change     float64 `json:"change"`
	ChangeRate float64 `json:"change_rate"`
	Timestamp  float64 `json:"timestamp"`
}

func (q *QuoteCache) GetQuotes(ctx context.Context, symbols []string) (map[string]domain.Quote, error) {
	if q.client == nil {
		return map[string]domain.Quote{}, nil
	}
	var requested []string
	for _, s := range symbols {
		trimmed := strings.TrimSpace(strings.ToUpper(s))
		if trimmed != "" {
			requested = append(requested, trimmed)
		}
	}
	if len(requested) == 0 {
		return map[string]domain.Quote{}, nil
	}
	keys := make([]string, len(requested))
	for i, s := range requested {
		keys[i] = QuotesKeyPrefix + s
	}
	rawList, err := q.client.MGet(ctx, keys...).Result()
	if err != nil {
		return nil, err
	}
	result := make(map[string]domain.Quote)
	for i, raw := range rawList {
		if raw == nil {
			continue
		}
		var data []byte
		switch v := raw.(type) {
		case string:
			data = []byte(v)
		case []byte:
			data = v
		default:
			continue
		}
		var entry quoteEntry
		if err := json.Unmarshal(data, &entry); err != nil {
			continue
		}
		ts := int(entry.Timestamp)
		if ts == 0 {
			ts = int(time.Now().Unix())
		}
		result[requested[i]] = domain.Quote{
			Symbol:     requested[i],
			Price:      entry.Price,
			Change:     entry.Change,
			ChangeRate: entry.ChangeRate,
			Timestamp:  ts,
		}
	}
	return result, nil
}

func (q *QuoteCache) SetQuotes(ctx context.Context, quotes map[string]domain.Quote) error {
	if q.client == nil || len(quotes) == 0 {
		return nil
	}
	pipe := q.client.Pipeline()
	for symbol, qt := range quotes {
		key := QuotesKeyPrefix + symbol
		entry := quoteEntry{
			Price:      qt.Price,
			Change:     qt.Change,
			ChangeRate: qt.ChangeRate,
			Timestamp:  float64(qt.Timestamp),
		}
		val, _ := json.Marshal(entry)
		pipe.Set(ctx, key, val, QuotesTTLSeconds*time.Second)
	}
	_, err := pipe.Exec(ctx)
	return err
}

