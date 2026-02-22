package application

import (
	"context"

	"finpulse/portfolio-api-go/internal/domain"
)

type QuoteRepository interface {
	GetBySymbols(ctx context.Context, symbols []string) ([]domain.Quote, error)
}

type InstrumentRepository interface {
	List(ctx context.Context, limit, offset int) ([]domain.Instrument, error)
}
