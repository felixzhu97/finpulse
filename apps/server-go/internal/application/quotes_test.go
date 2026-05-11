package application

import (
	"context"
	"errors"
	"testing"

	"finpulse/server-go/internal/domain"
)

type mockQuoteRepo struct {
	quotes []domain.Quote
	err   error
}

func (m *mockQuoteRepo) GetBySymbols(ctx context.Context, symbols []string) ([]domain.Quote, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.quotes, nil
}

func TestQuotesService_GetQuotes(t *testing.T) {
	t.Run("empty symbols returns nil", func(t *testing.T) {
		repo := &mockQuoteRepo{}
		svc := NewQuotesService(repo)

		result, err := svc.GetQuotes(context.Background(), "")

		if err != nil {
			t.Errorf("GetQuotes() error = %v; want nil", err)
		}
		if result != nil {
			t.Errorf("GetQuotes() = %v; want nil", result)
		}
	})

	t.Run("returns quotes for symbols", func(t *testing.T) {
		repo := &mockQuoteRepo{
			quotes: []domain.Quote{
				{Symbol: "AAPL", Price: 150.0},
				{Symbol: "GOOGL", Price: 2800.0},
			},
		}
		svc := NewQuotesService(repo)

		result, err := svc.GetQuotes(context.Background(), "AAPL,GOOGL")

		if err != nil {
			t.Errorf("GetQuotes() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
		if result["AAPL"].Price != 150.0 {
			t.Errorf("AAPL price = %v; want 150.0", result["AAPL"].Price)
		}
	})

	t.Run("trims and uppercases symbols", func(t *testing.T) {
		repo := &mockQuoteRepo{
			quotes: []domain.Quote{
				{Symbol: "MSFT", Price: 300.0},
			},
		}
		svc := NewQuotesService(repo)

		result, err := svc.GetQuotes(context.Background(), "  msft  ,  msft  ")

		if err != nil {
			t.Errorf("GetQuotes() error = %v; want nil", err)
		}
		if _, ok := result["MSFT"]; !ok {
			t.Error("MSFT key not found")
		}
	})

	t.Run("only whitespace symbols returns nil", func(t *testing.T) {
		repo := &mockQuoteRepo{}
		svc := NewQuotesService(repo)

		result, err := svc.GetQuotes(context.Background(), "   ,   ")

		if err != nil {
			t.Errorf("GetQuotes() error = %v; want nil", err)
		}
		if result != nil {
			t.Errorf("GetQuotes() = %v; want nil", result)
		}
	})

	t.Run("repo error propagates", func(t *testing.T) {
		repo := &mockQuoteRepo{err: errors.New("database error")}
		svc := NewQuotesService(repo)

		_, err := svc.GetQuotes(context.Background(), "AAPL")

		if err == nil {
			t.Error("GetQuotes() error = nil; want error")
		}
	})
}
