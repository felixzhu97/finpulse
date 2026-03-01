package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type PositionService struct {
	repo PositionRepo
}

func NewPositionService(repo PositionRepo) *PositionService {
	return &PositionService{repo: repo}
}

func (s *PositionService) List(ctx context.Context, limit, offset int) ([]domain.Position, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *PositionService) GetByID(ctx context.Context, id string) (*domain.Position, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *PositionService) Create(ctx context.Context, p *domain.Position) (*domain.Position, error) {
	return s.repo.Add(ctx, p)
}

func (s *PositionService) CreateBatch(ctx context.Context, entities []domain.Position) ([]domain.Position, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *PositionService) Update(ctx context.Context, p *domain.Position) (*domain.Position, error) {
	return s.repo.Save(ctx, p)
}

func (s *PositionService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
