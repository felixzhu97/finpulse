package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type InstrumentsService struct {
	repo InstrumentRepo
}

func NewInstrumentsService(repo InstrumentRepo) *InstrumentsService {
	return &InstrumentsService{repo: repo}
}

func (s *InstrumentsService) List(ctx context.Context, limit, offset int) ([]domain.Instrument, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *InstrumentsService) GetByID(ctx context.Context, id string) (*domain.Instrument, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *InstrumentsService) Create(ctx context.Context, i *domain.Instrument) (*domain.Instrument, error) {
	return s.repo.Add(ctx, i)
}

func (s *InstrumentsService) CreateBatch(ctx context.Context, entities []domain.Instrument) ([]domain.Instrument, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *InstrumentsService) Update(ctx context.Context, i *domain.Instrument) (*domain.Instrument, error) {
	return s.repo.Save(ctx, i)
}

func (s *InstrumentsService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
