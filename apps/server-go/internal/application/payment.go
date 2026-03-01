package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type PaymentService struct {
	repo PaymentRepo
}

func NewPaymentService(repo PaymentRepo) *PaymentService {
	return &PaymentService{repo: repo}
}

func (s *PaymentService) List(ctx context.Context, limit, offset int) ([]domain.Payment, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *PaymentService) GetByID(ctx context.Context, id string) (*domain.Payment, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *PaymentService) Create(ctx context.Context, p *domain.Payment) (*domain.Payment, error) {
	return s.repo.Add(ctx, p)
}

func (s *PaymentService) CreateBatch(ctx context.Context, entities []domain.Payment) ([]domain.Payment, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *PaymentService) Update(ctx context.Context, p *domain.Payment) (*domain.Payment, error) {
	return s.repo.Save(ctx, p)
}

func (s *PaymentService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
