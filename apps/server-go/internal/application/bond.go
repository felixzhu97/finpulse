package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type BondService struct {
	repo BondRepo
}

func NewBondService(repo BondRepo) *BondService {
	return &BondService{repo: repo}
}

func (s *BondService) List(ctx context.Context, limit, offset int) ([]domain.Bond, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *BondService) GetByID(ctx context.Context, id string) (*domain.Bond, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *BondService) Create(ctx context.Context, b *domain.Bond) (*domain.Bond, error) {
	return s.repo.Add(ctx, b)
}

func (s *BondService) CreateBatch(ctx context.Context, entities []domain.Bond) ([]domain.Bond, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *BondService) Update(ctx context.Context, b *domain.Bond) (*domain.Bond, error) {
	return s.repo.Save(ctx, b)
}

func (s *BondService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
