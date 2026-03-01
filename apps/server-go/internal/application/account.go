package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type AccountService struct {
	repo AccountRepo
}

func NewAccountService(repo AccountRepo) *AccountService {
	return &AccountService{repo: repo}
}

func (s *AccountService) List(ctx context.Context, limit, offset int) ([]domain.Account, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *AccountService) GetByID(ctx context.Context, id string) (*domain.Account, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *AccountService) Create(ctx context.Context, a *domain.Account) (*domain.Account, error) {
	return s.repo.Add(ctx, a)
}

func (s *AccountService) CreateBatch(ctx context.Context, entities []domain.Account) ([]domain.Account, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *AccountService) Update(ctx context.Context, a *domain.Account) (*domain.Account, error) {
	return s.repo.Save(ctx, a)
}

func (s *AccountService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
