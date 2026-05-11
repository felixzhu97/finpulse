package application

import (
	"context"
	"errors"
	"testing"

	"finpulse/server-go/internal/domain"
)

type watchlistItemRepoMock struct {
	items []domain.WatchlistItem
	byID  map[string]*domain.WatchlistItem
	err   error
}

func newWatchlistItemRepoMock(items []domain.WatchlistItem) *watchlistItemRepoMock {
	m := &watchlistItemRepoMock{
		items: items,
		byID:  make(map[string]*domain.WatchlistItem),
	}
	for i := range items {
		m.byID[items[i].WatchlistItemID] = &items[i]
	}
	return m
}

func (m *watchlistItemRepoMock) List(ctx context.Context, limit, offset int) ([]domain.WatchlistItem, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

func (m *watchlistItemRepoMock) GetByID(ctx context.Context, id string) (*domain.WatchlistItem, error) {
	if m.err != nil {
		return nil, m.err
	}
	if item, ok := m.byID[id]; ok {
		return item, nil
	}
	return nil, ErrNotFound
}

func (m *watchlistItemRepoMock) Add(ctx context.Context, item *domain.WatchlistItem) (*domain.WatchlistItem, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[item.WatchlistItemID] = item
	m.items = append(m.items, *item)
	return item, nil
}

func (m *watchlistItemRepoMock) AddMany(ctx context.Context, entities []domain.WatchlistItem) ([]domain.WatchlistItem, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].WatchlistItemID] = &entities[i]
	}
	m.items = append(m.items, entities...)
	return entities, nil
}

func (m *watchlistItemRepoMock) Save(ctx context.Context, item *domain.WatchlistItem) (*domain.WatchlistItem, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[item.WatchlistItemID] = item
	for i, it := range m.items {
		if it.WatchlistItemID == item.WatchlistItemID {
			m.items[i] = *item
			return item, nil
		}
	}
	return nil, ErrNotFound
}

func (m *watchlistItemRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, it := range m.items {
		if it.WatchlistItemID == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestWatchlistItemService(t *testing.T) {
	t.Run("List returns items", func(t *testing.T) {
		repo := newWatchlistItemRepoMock([]domain.WatchlistItem{
			{WatchlistItemID: "item-1", WatchlistID: "wl-1", InstrumentID: "AAPL"},
			{WatchlistItemID: "item-2", WatchlistID: "wl-1", InstrumentID: "GOOGL"},
		})
		svc := NewWatchlistItemService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns item", func(t *testing.T) {
		repo := newWatchlistItemRepoMock([]domain.WatchlistItem{
			{WatchlistItemID: "item-1", WatchlistID: "wl-1", InstrumentID: "AAPL"},
		})
		svc := NewWatchlistItemService(repo)

		result, err := svc.GetByID(context.Background(), "item-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.InstrumentID != "AAPL" {
			t.Errorf("InstrumentID = %q; want AAPL", result.InstrumentID)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newWatchlistItemRepoMock(nil)
		svc := NewWatchlistItemService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds item", func(t *testing.T) {
		repo := newWatchlistItemRepoMock(nil)
		svc := NewWatchlistItemService(repo)
		item := &domain.WatchlistItem{WatchlistItemID: "item-new", WatchlistID: "wl-1", InstrumentID: "TSLA"}

		result, err := svc.Create(context.Background(), item)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.WatchlistItemID != "item-new" {
			t.Errorf("WatchlistItemID = %q; want item-new", result.WatchlistItemID)
		}
	})

	t.Run("CreateBatch adds multiple items", func(t *testing.T) {
		repo := newWatchlistItemRepoMock(nil)
		svc := NewWatchlistItemService(repo)
		entities := []domain.WatchlistItem{
			{WatchlistItemID: "item-1", WatchlistID: "wl-1", InstrumentID: "AAPL"},
			{WatchlistItemID: "item-2", WatchlistID: "wl-1", InstrumentID: "GOOGL"},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies item", func(t *testing.T) {
		repo := newWatchlistItemRepoMock([]domain.WatchlistItem{
			{WatchlistItemID: "item-1", WatchlistID: "wl-1", InstrumentID: "AAPL"},
		})
		svc := NewWatchlistItemService(repo)
		updated := &domain.WatchlistItem{WatchlistItemID: "item-1", WatchlistID: "wl-1", InstrumentID: "MSFT"}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.InstrumentID != "MSFT" {
			t.Errorf("InstrumentID = %q; want MSFT", result.InstrumentID)
		}
	})

	t.Run("Delete removes item", func(t *testing.T) {
		repo := newWatchlistItemRepoMock([]domain.WatchlistItem{
			{WatchlistItemID: "item-1", WatchlistID: "wl-1", InstrumentID: "AAPL"},
		})
		svc := NewWatchlistItemService(repo)

		ok, err := svc.Delete(context.Background(), "item-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newWatchlistItemRepoMock(nil)
		svc := NewWatchlistItemService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
