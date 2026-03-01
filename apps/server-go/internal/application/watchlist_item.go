package application

import (
	"context"

	"finpulse/server-go/internal/domain"
)

type WatchlistItemService struct {
	repo WatchlistItemRepo
}

func NewWatchlistItemService(repo WatchlistItemRepo) *WatchlistItemService {
	return &WatchlistItemService{repo: repo}
}

func (s *WatchlistItemService) List(ctx context.Context, limit, offset int) ([]domain.WatchlistItem, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *WatchlistItemService) GetByID(ctx context.Context, id string) (*domain.WatchlistItem, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *WatchlistItemService) Create(ctx context.Context, w *domain.WatchlistItem) (*domain.WatchlistItem, error) {
	return s.repo.Add(ctx, w)
}

func (s *WatchlistItemService) CreateBatch(ctx context.Context, entities []domain.WatchlistItem) ([]domain.WatchlistItem, error) {
	return s.repo.AddMany(ctx, entities)
}

func (s *WatchlistItemService) Update(ctx context.Context, w *domain.WatchlistItem) (*domain.WatchlistItem, error) {
	return s.repo.Save(ctx, w)
}

func (s *WatchlistItemService) Delete(ctx context.Context, id string) (bool, error) {
	return s.repo.Remove(ctx, id)
}
