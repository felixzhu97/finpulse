package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type UserPreferenceService struct {
	repo UserPreferenceRepo
}

func NewUserPreferenceService(repo UserPreferenceRepo) *UserPreferenceService {
	return &UserPreferenceService{repo: repo}
}

func (s *UserPreferenceService) List(ctx context.Context, limit, offset int) ([]domain.UserPreference, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *UserPreferenceService) GetByID(ctx context.Context, id string) (*domain.UserPreference, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *UserPreferenceService) Create(ctx context.Context, u *domain.UserPreference) (*domain.UserPreference, error) {
	return s.repo.Add(ctx, u)
}

func (s *UserPreferenceService) CreateBatch(ctx context.Context, entities []domain.UserPreference) ([]domain.UserPreference, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *UserPreferenceService) Update(ctx context.Context, u *domain.UserPreference) (*domain.UserPreference, error) {
	return s.repo.Save(ctx, u)
}

func (s *UserPreferenceService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
