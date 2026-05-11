package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"finpulse/server-go/internal/domain"
)

type marketDataRepoMock struct {
	data []domain.MarketData
	byID map[string]*domain.MarketData
	err  error
}

func newMarketDataRepoMock(data []domain.MarketData) *marketDataRepoMock {
	m := &marketDataRepoMock{
		data: data,
		byID: make(map[string]*domain.MarketData),
	}
	for i := range data {
		m.byID[data[i].DataID] = &data[i]
	}
	return m
}

func (m *marketDataRepoMock) List(ctx context.Context, limit, offset int) ([]domain.MarketData, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.data, nil
}

func (m *marketDataRepoMock) GetByID(ctx context.Context, id string) (*domain.MarketData, error) {
	if m.err != nil {
		return nil, m.err
	}
	if d, ok := m.byID[id]; ok {
		return d, nil
	}
	return nil, ErrNotFound
}

func (m *marketDataRepoMock) Add(ctx context.Context, d *domain.MarketData) (*domain.MarketData, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[d.DataID] = d
	m.data = append(m.data, *d)
	return d, nil
}

func (m *marketDataRepoMock) AddMany(ctx context.Context, entities []domain.MarketData) ([]domain.MarketData, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].DataID] = &entities[i]
	}
	m.data = append(m.data, entities...)
	return entities, nil
}

func (m *marketDataRepoMock) Save(ctx context.Context, d *domain.MarketData) (*domain.MarketData, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[d.DataID] = d
	for i, data := range m.data {
		if data.DataID == d.DataID {
			m.data[i] = *d
			return d, nil
		}
	}
	return nil, ErrNotFound
}

func (m *marketDataRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, d := range m.data {
		if d.DataID == id {
			m.data = append(m.data[:i], m.data[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestMarketDataService(t *testing.T) {
	t.Run("List returns market data", func(t *testing.T) {
		repo := newMarketDataRepoMock([]domain.MarketData{
			{DataID: "md-1", InstrumentID: "AAPL", Close: 150.0},
			{DataID: "md-2", InstrumentID: "GOOGL", Close: 2800.0},
		})
		svc := NewMarketDataService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns market data", func(t *testing.T) {
		repo := newMarketDataRepoMock([]domain.MarketData{
			{DataID: "md-1", InstrumentID: "AAPL", Close: 150.0},
		})
		svc := NewMarketDataService(repo)

		result, err := svc.GetByID(context.Background(), "md-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.InstrumentID != "AAPL" {
			t.Errorf("InstrumentID = %q; want AAPL", result.InstrumentID)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newMarketDataRepoMock(nil)
		svc := NewMarketDataService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds market data", func(t *testing.T) {
		repo := newMarketDataRepoMock(nil)
		svc := NewMarketDataService(repo)
		now := time.Now()
		data := &domain.MarketData{DataID: "md-new", InstrumentID: "TSLA", Close: 700.0, Timestamp: now}

		result, err := svc.Create(context.Background(), data)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.DataID != "md-new" {
			t.Errorf("DataID = %q; want md-new", result.DataID)
		}
	})

	t.Run("CreateBatch adds multiple market data", func(t *testing.T) {
		repo := newMarketDataRepoMock(nil)
		svc := NewMarketDataService(repo)
		entities := []domain.MarketData{
			{DataID: "md-1", InstrumentID: "AAPL", Close: 150.0},
			{DataID: "md-2", InstrumentID: "GOOGL", Close: 2800.0},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies market data", func(t *testing.T) {
		repo := newMarketDataRepoMock([]domain.MarketData{
			{DataID: "md-1", InstrumentID: "AAPL", Close: 150.0},
		})
		svc := NewMarketDataService(repo)
		updated := &domain.MarketData{DataID: "md-1", InstrumentID: "AAPL", Close: 155.0}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Close != 155.0 {
			t.Errorf("Close = %v; want 155.0", result.Close)
		}
	})

	t.Run("Delete removes market data", func(t *testing.T) {
		repo := newMarketDataRepoMock([]domain.MarketData{
			{DataID: "md-1", InstrumentID: "AAPL", Close: 150.0},
		})
		svc := NewMarketDataService(repo)

		ok, err := svc.Delete(context.Background(), "md-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newMarketDataRepoMock(nil)
		svc := NewMarketDataService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})

	t.Run("List with pagination", func(t *testing.T) {
		repo := newMarketDataRepoMock([]domain.MarketData{
			{DataID: "md-1", InstrumentID: "AAPL", Close: 150.0},
			{DataID: "md-2", InstrumentID: "GOOGL", Close: 2800.0},
			{DataID: "md-3", InstrumentID: "TSLA", Close: 700.0},
		})
		svc := NewMarketDataService(repo)

		result, err := svc.List(context.Background(), 2, 1)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 3 {
			t.Errorf("len(result) = %d; want 3 (returns all, limit/offset used by repo)", len(result))
		}
	})

	t.Run("Create returns error on repo failure", func(t *testing.T) {
		repo := &marketDataRepoMock{err: errors.New("repo error")}
		svc := NewMarketDataService(repo)
		data := &domain.MarketData{DataID: "md-new", InstrumentID: "TSLA", Close: 700.0}

		_, err := svc.Create(context.Background(), data)

		if err == nil {
			t.Error("Create() error = nil; want repo error")
		}
	})
}
