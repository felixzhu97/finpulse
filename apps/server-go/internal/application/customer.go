package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type CustomerService struct {
	repo CustomerRepo
}

func NewCustomerService(repo CustomerRepo) *CustomerService {
	return &CustomerService{repo: repo}
}

func (s *CustomerService) List(ctx context.Context, limit, offset int) ([]domain.Customer, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *CustomerService) GetByID(ctx context.Context, id string) (*domain.Customer, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *CustomerService) Create(ctx context.Context, c *domain.Customer) (*domain.Customer, error) {
	return s.repo.Add(ctx, c)
}

func (s *CustomerService) CreateBatch(ctx context.Context, entities []domain.Customer) ([]domain.Customer, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *CustomerService) Update(ctx context.Context, c *domain.Customer) (*domain.Customer, error) {
	return s.repo.Save(ctx, c)
}

func (s *CustomerService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
