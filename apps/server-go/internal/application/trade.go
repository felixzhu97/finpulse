package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type TradeService struct {
	repo TradeRepo
}

func NewTradeService(repo TradeRepo) *TradeService {
	return &TradeService{repo: repo}
}

func (s *TradeService) List(ctx context.Context, limit, offset int) ([]domain.Trade, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *TradeService) GetByID(ctx context.Context, id string) (*domain.Trade, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *TradeService) Create(ctx context.Context, t *domain.Trade) (*domain.Trade, error) {
	return s.repo.Add(ctx, t)
}

func (s *TradeService) CreateBatch(ctx context.Context, entities []domain.Trade) ([]domain.Trade, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *TradeService) Update(ctx context.Context, t *domain.Trade) (*domain.Trade, error) {
	return s.repo.Save(ctx, t)
}

func (s *TradeService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
