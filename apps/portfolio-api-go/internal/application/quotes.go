package application

import (
	"context"
	"strings"

	"finpulse/portfolio-api-go/internal/domain"
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
