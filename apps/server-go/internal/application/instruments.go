package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type InstrumentsService struct {
	repo InstrumentRepository
}

func NewInstrumentsService(repo InstrumentRepository) *InstrumentsService {
	return &InstrumentsService{repo: repo}
}

func (s *InstrumentsService) List(ctx context.Context, limit, offset int) ([]domain.Instrument, error) {
	return s.repo.List(ctx, limit, offset)
}
