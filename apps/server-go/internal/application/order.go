package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type OrderService struct {
	repo OrderRepo
}

func NewOrderService(repo OrderRepo) *OrderService {
	return &OrderService{repo: repo}
}

func (s *OrderService) List(ctx context.Context, limit, offset int) ([]domain.Order, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *OrderService) GetByID(ctx context.Context, id string) (*domain.Order, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *OrderService) Create(ctx context.Context, o *domain.Order) (*domain.Order, error) {
	return s.repo.Add(ctx, o)
}

func (s *OrderService) CreateBatch(ctx context.Context, entities []domain.Order) ([]domain.Order, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *OrderService) Update(ctx context.Context, o *domain.Order) (*domain.Order, error) {
	return s.repo.Save(ctx, o)
}

func (s *OrderService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
