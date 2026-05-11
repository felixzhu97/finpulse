package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"finpulse/server-go/internal/domain"
)

type tradeRepoMock struct {
	trades []domain.Trade
	byID   map[string]*domain.Trade
	err    error
}

func newTradeRepoMock(trades []domain.Trade) *tradeRepoMock {
	m := &tradeRepoMock{
		trades: trades,
		byID:   make(map[string]*domain.Trade),
	}
	for i := range trades {
		m.byID[trades[i].TradeID] = &trades[i]
	}
	return m
}

func (m *tradeRepoMock) List(ctx context.Context, limit, offset int) ([]domain.Trade, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.trades, nil
}

func (m *tradeRepoMock) GetByID(ctx context.Context, id string) (*domain.Trade, error) {
	if m.err != nil {
		return nil, m.err
	}
	if t, ok := m.byID[id]; ok {
		return t, nil
	}
	return nil, ErrNotFound
}

func (m *tradeRepoMock) Add(ctx context.Context, t *domain.Trade) (*domain.Trade, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[t.TradeID] = t
	m.trades = append(m.trades, *t)
	return t, nil
}

func (m *tradeRepoMock) AddMany(ctx context.Context, entities []domain.Trade) ([]domain.Trade, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].TradeID] = &entities[i]
	}
	m.trades = append(m.trades, entities...)
	return entities, nil
}

func (m *tradeRepoMock) Save(ctx context.Context, t *domain.Trade) (*domain.Trade, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[t.TradeID] = t
	for i, trade := range m.trades {
		if trade.TradeID == t.TradeID {
			m.trades[i] = *t
			return t, nil
		}
	}
	return nil, ErrNotFound
}

func (m *tradeRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, t := range m.trades {
		if t.TradeID == id {
			m.trades = append(m.trades[:i], m.trades[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestTradeService(t *testing.T) {
	t.Run("List returns trades", func(t *testing.T) {
		repo := newTradeRepoMock([]domain.Trade{
			{TradeID: "tr-1", Quantity: 100, Price: 150.0},
			{TradeID: "tr-2", Quantity: 50, Price: 200.0},
		})
		svc := NewTradeService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns trade", func(t *testing.T) {
		repo := newTradeRepoMock([]domain.Trade{
			{TradeID: "tr-1", Quantity: 100, Price: 150.0},
		})
		svc := NewTradeService(repo)

		result, err := svc.GetByID(context.Background(), "tr-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.Quantity != 100 {
			t.Errorf("Quantity = %v; want 100", result.Quantity)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newTradeRepoMock(nil)
		svc := NewTradeService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds trade", func(t *testing.T) {
		repo := newTradeRepoMock(nil)
		svc := NewTradeService(repo)
		now := time.Now()
		trade := &domain.Trade{TradeID: "tr-new", Quantity: 100, Price: 150.0, ExecutedAt: now}

		result, err := svc.Create(context.Background(), trade)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.TradeID != "tr-new" {
			t.Errorf("TradeID = %q; want tr-new", result.TradeID)
		}
	})

	t.Run("CreateBatch adds multiple trades", func(t *testing.T) {
		repo := newTradeRepoMock(nil)
		svc := NewTradeService(repo)
		entities := []domain.Trade{
			{TradeID: "tr-1", Quantity: 100, Price: 150.0},
			{TradeID: "tr-2", Quantity: 50, Price: 200.0},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies trade", func(t *testing.T) {
		repo := newTradeRepoMock([]domain.Trade{
			{TradeID: "tr-1", Quantity: 100, Price: 150.0},
		})
		svc := NewTradeService(repo)
		updated := &domain.Trade{TradeID: "tr-1", Quantity: 200, Price: 155.0}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Quantity != 200 {
			t.Errorf("Quantity = %v; want 200", result.Quantity)
		}
	})

	t.Run("Delete removes trade", func(t *testing.T) {
		repo := newTradeRepoMock([]domain.Trade{
			{TradeID: "tr-1", Quantity: 100, Price: 150.0},
		})
		svc := NewTradeService(repo)

		ok, err := svc.Delete(context.Background(), "tr-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newTradeRepoMock(nil)
		svc := NewTradeService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
