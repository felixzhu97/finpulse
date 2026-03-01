package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type OptionService struct {
	repo OptionRepo
}

func NewOptionService(repo OptionRepo) *OptionService {
	return &OptionService{repo: repo}
}

func (s *OptionService) List(ctx context.Context, limit, offset int) ([]domain.Option, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *OptionService) GetByID(ctx context.Context, id string) (*domain.Option, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *OptionService) Create(ctx context.Context, o *domain.Option) (*domain.Option, error) {
	return s.repo.Add(ctx, o)
}

func (s *OptionService) CreateBatch(ctx context.Context, entities []domain.Option) ([]domain.Option, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *OptionService) Update(ctx context.Context, o *domain.Option) (*domain.Option, error) {
	return s.repo.Save(ctx, o)
}

func (s *OptionService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
