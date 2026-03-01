package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type SettlementService struct {
	repo SettlementRepo
}

func NewSettlementService(repo SettlementRepo) *SettlementService {
	return &SettlementService{repo: repo}
}

func (s *SettlementService) List(ctx context.Context, limit, offset int) ([]domain.Settlement, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *SettlementService) GetByID(ctx context.Context, id string) (*domain.Settlement, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *SettlementService) Create(ctx context.Context, s2 *domain.Settlement) (*domain.Settlement, error) {
	return s.repo.Add(ctx, s2)
}

func (s *SettlementService) CreateBatch(ctx context.Context, entities []domain.Settlement) ([]domain.Settlement, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *SettlementService) Update(ctx context.Context, s2 *domain.Settlement) (*domain.Settlement, error) {
	return s.repo.Save(ctx, s2)
}

func (s *SettlementService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
