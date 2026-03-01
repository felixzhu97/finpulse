package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type MarketDataService struct {
	repo MarketDataRepo
}

func NewMarketDataService(repo MarketDataRepo) *MarketDataService {
	return &MarketDataService{repo: repo}
}

func (s *MarketDataService) List(ctx context.Context, limit, offset int) ([]domain.MarketData, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *MarketDataService) GetByID(ctx context.Context, id string) (*domain.MarketData, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *MarketDataService) Create(ctx context.Context, m *domain.MarketData) (*domain.MarketData, error) {
	return s.repo.Add(ctx, m)
}

func (s *MarketDataService) CreateBatch(ctx context.Context, entities []domain.MarketData) ([]domain.MarketData, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *MarketDataService) Update(ctx context.Context, m *domain.MarketData) (*domain.MarketData, error) {
	return s.repo.Save(ctx, m)
}

func (s *MarketDataService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
