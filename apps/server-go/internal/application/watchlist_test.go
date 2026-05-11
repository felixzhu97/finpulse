package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"finpulse/server-go/internal/domain"
)

type watchlistRepoMock struct {
	watchlists []domain.Watchlist
	byID      map[string]*domain.Watchlist
	err       error
}

func newWatchlistRepoMock(watchlists []domain.Watchlist) *watchlistRepoMock {
	m := &watchlistRepoMock{
		watchlists: watchlists,
		byID:      make(map[string]*domain.Watchlist),
	}
	for i := range watchlists {
		m.byID[watchlists[i].WatchlistID] = &watchlists[i]
	}
	return m
}

func (m *watchlistRepoMock) List(ctx context.Context, limit, offset int) ([]domain.Watchlist, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.watchlists, nil
}

func (m *watchlistRepoMock) GetByID(ctx context.Context, id string) (*domain.Watchlist, error) {
	if m.err != nil {
		return nil, m.err
	}
	if w, ok := m.byID[id]; ok {
		return w, nil
	}
	return nil, ErrNotFound
}

func (m *watchlistRepoMock) Add(ctx context.Context, w *domain.Watchlist) (*domain.Watchlist, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[w.WatchlistID] = w
	m.watchlists = append(m.watchlists, *w)
	return w, nil
}

func (m *watchlistRepoMock) AddMany(ctx context.Context, entities []domain.Watchlist) ([]domain.Watchlist, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].WatchlistID] = &entities[i]
	}
	m.watchlists = append(m.watchlists, entities...)
	return entities, nil
}

func (m *watchlistRepoMock) Save(ctx context.Context, w *domain.Watchlist) (*domain.Watchlist, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[w.WatchlistID] = w
	for i, wl := range m.watchlists {
		if wl.WatchlistID == w.WatchlistID {
			m.watchlists[i] = *w
			return w, nil
		}
	}
	return nil, ErrNotFound
}

func (m *watchlistRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, w := range m.watchlists {
		if w.WatchlistID == id {
			m.watchlists = append(m.watchlists[:i], m.watchlists[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestWatchlistService(t *testing.T) {
	t.Run("List returns watchlists", func(t *testing.T) {
		repo := newWatchlistRepoMock([]domain.Watchlist{
			{WatchlistID: "wl-1", Name: "Tech Stocks"},
			{WatchlistID: "wl-2", Name: "Crypto"},
		})
		svc := NewWatchlistService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns watchlist", func(t *testing.T) {
		repo := newWatchlistRepoMock([]domain.Watchlist{
			{WatchlistID: "wl-1", Name: "Tech Stocks"},
		})
		svc := NewWatchlistService(repo)

		result, err := svc.GetByID(context.Background(), "wl-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.Name != "Tech Stocks" {
			t.Errorf("Name = %q; want Tech Stocks", result.Name)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newWatchlistRepoMock(nil)
		svc := NewWatchlistService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds watchlist", func(t *testing.T) {
		repo := newWatchlistRepoMock(nil)
		svc := NewWatchlistService(repo)
		now := time.Now()
		watchlist := &domain.Watchlist{WatchlistID: "wl-new", Name: "New Watchlist", CreatedAt: now}

		result, err := svc.Create(context.Background(), watchlist)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.WatchlistID != "wl-new" {
			t.Errorf("WatchlistID = %q; want wl-new", result.WatchlistID)
		}
	})

	t.Run("CreateBatch adds multiple watchlists", func(t *testing.T) {
		repo := newWatchlistRepoMock(nil)
		svc := NewWatchlistService(repo)
		entities := []domain.Watchlist{
			{WatchlistID: "wl-1", Name: "Tech Stocks"},
			{WatchlistID: "wl-2", Name: "Crypto"},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies watchlist", func(t *testing.T) {
		repo := newWatchlistRepoMock([]domain.Watchlist{
			{WatchlistID: "wl-1", Name: "Old Name"},
		})
		svc := NewWatchlistService(repo)
		updated := &domain.Watchlist{WatchlistID: "wl-1", Name: "New Name"}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Name != "New Name" {
			t.Errorf("Name = %q; want New Name", result.Name)
		}
	})

	t.Run("Delete removes watchlist", func(t *testing.T) {
		repo := newWatchlistRepoMock([]domain.Watchlist{
			{WatchlistID: "wl-1", Name: "Tech Stocks"},
		})
		svc := NewWatchlistService(repo)

		ok, err := svc.Delete(context.Background(), "wl-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newWatchlistRepoMock(nil)
		svc := NewWatchlistService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
