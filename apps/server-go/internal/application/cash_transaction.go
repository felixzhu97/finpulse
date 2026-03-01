package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type CashTransactionService struct {
	repo CashTransactionRepo
}

func NewCashTransactionService(repo CashTransactionRepo) *CashTransactionService {
	return &CashTransactionService{repo: repo}
}

func (s *CashTransactionService) List(ctx context.Context, limit, offset int) ([]domain.CashTransaction, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *CashTransactionService) GetByID(ctx context.Context, id string) (*domain.CashTransaction, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *CashTransactionService) Create(ctx context.Context, c *domain.CashTransaction) (*domain.CashTransaction, error) {
	return s.repo.Add(ctx, c)
}

func (s *CashTransactionService) CreateBatch(ctx context.Context, entities []domain.CashTransaction) ([]domain.CashTransaction, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *CashTransactionService) Update(ctx context.Context, c *domain.CashTransaction) (*domain.CashTransaction, error) {
	return s.repo.Save(ctx, c)
}

func (s *CashTransactionService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
