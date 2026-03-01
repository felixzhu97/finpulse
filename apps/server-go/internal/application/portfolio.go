package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type PortfolioService struct {
	repo PortfolioRepo
}

func NewPortfolioService(repo PortfolioRepo) *PortfolioService {
	return &PortfolioService{repo: repo}
}

func (s *PortfolioService) List(ctx context.Context, limit, offset int) ([]domain.PortfolioSchema, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *PortfolioService) GetByID(ctx context.Context, id string) (*domain.PortfolioSchema, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *PortfolioService) Create(ctx context.Context, p *domain.PortfolioSchema) (*domain.PortfolioSchema, error) {
	return s.repo.Add(ctx, p)
}

func (s *PortfolioService) CreateBatch(ctx context.Context, entities []domain.PortfolioSchema) ([]domain.PortfolioSchema, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *PortfolioService) Update(ctx context.Context, p *domain.PortfolioSchema) (*domain.PortfolioSchema, error) {
	return s.repo.Save(ctx, p)
}

func (s *PortfolioService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
