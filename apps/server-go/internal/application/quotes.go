package application

import (
	"context"
	"math/rand"
	"strings"

	"finpulse/server-go/internal/domain"
)

type QuotesService struct {
	repo QuoteRepository
}

func NewQuotesService(repo QuoteRepository) *QuotesService {
	return &QuotesService{repo: repo}
}

func (s *QuotesService) GetQuotes(ctx context.Context, symbolsParam string) (map[string]domain.Quote, error) {
	if symbolsParam == "" {
		return nil, nil
	}
	var symbols []string
	for _, p := range strings.Split(symbolsParam, ",") {
		p = strings.TrimSpace(strings.ToUpper(p))
		if p != "" {
			symbols = append(symbols, p)
		}
	}
	if len(symbols) == 0 {
		return nil, nil
	}
	list, err := s.repo.GetBySymbols(ctx, symbols)
	if err != nil {
		return nil, err
	}
	out := make(map[string]domain.Quote, len(list))
	for _, q := range list {
		out[q.Symbol] = q
	}
	return out, nil
}

func (s *QuotesService) GetHistory(ctx context.Context, symbols []string, minutes int) (map[string][]float64, error) {
	quotes, err := s.repo.GetBySymbols(ctx, symbols)
	if err != nil {
		return nil, err
	}
	priceMap := make(map[string]float64)
	for _, q := range quotes {
		priceMap[q.Symbol] = q.Price
	}
	out := make(map[string][]float64, len(symbols))
	for _, sym := range symbols {
		basePrice, ok := priceMap[sym]
		if !ok {
			basePrice = 100.0
		}
		n := minutes
		if n < 1 {
			n = 1
		}
		history := make([]float64, n)
		p := basePrice
		for i := 0; i < n; i++ {
			p += (rand.Float64() - 0.5) * basePrice * 0.01
			history[i] = float64(int(p*100)) / 100
		}
		out[sym] = history
	}
	return out, nil
}
