package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type WatchlistService struct {
	repo WatchlistRepo
}

func NewWatchlistService(repo WatchlistRepo) *WatchlistService {
	return &WatchlistService{repo: repo}
}

func (s *WatchlistService) List(ctx context.Context, limit, offset int) ([]domain.Watchlist, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *WatchlistService) GetByID(ctx context.Context, id string) (*domain.Watchlist, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *WatchlistService) Create(ctx context.Context, w *domain.Watchlist) (*domain.Watchlist, error) {
	return s.repo.Add(ctx, w)
}

func (s *WatchlistService) CreateBatch(ctx context.Context, entities []domain.Watchlist) ([]domain.Watchlist, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *WatchlistService) Update(ctx context.Context, w *domain.Watchlist) (*domain.Watchlist, error) {
	return s.repo.Save(ctx, w)
}

func (s *WatchlistService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
