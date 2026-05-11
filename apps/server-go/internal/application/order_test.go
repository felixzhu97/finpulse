package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"finpulse/server-go/internal/domain"
)

type orderRepoMock struct {
	orders []domain.Order
	byID   map[string]*domain.Order
	err    error
}

func newOrderRepoMock(orders []domain.Order) *orderRepoMock {
	m := &orderRepoMock{
		orders: orders,
		byID:   make(map[string]*domain.Order),
	}
	for i := range orders {
		m.byID[orders[i].OrderID] = &orders[i]
	}
	return m
}

func (m *orderRepoMock) List(ctx context.Context, limit, offset int) ([]domain.Order, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.orders, nil
}

func (m *orderRepoMock) GetByID(ctx context.Context, id string) (*domain.Order, error) {
	if m.err != nil {
		return nil, m.err
	}
	if o, ok := m.byID[id]; ok {
		return o, nil
	}
	return nil, ErrNotFound
}

func (m *orderRepoMock) Add(ctx context.Context, o *domain.Order) (*domain.Order, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[o.OrderID] = o
	m.orders = append(m.orders, *o)
	return o, nil
}

func (m *orderRepoMock) AddMany(ctx context.Context, entities []domain.Order) ([]domain.Order, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].OrderID] = &entities[i]
	}
	m.orders = append(m.orders, entities...)
	return entities, nil
}

func (m *orderRepoMock) Save(ctx context.Context, o *domain.Order) (*domain.Order, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[o.OrderID] = o
	for i, order := range m.orders {
		if order.OrderID == o.OrderID {
			m.orders[i] = *o
			return o, nil
		}
	}
	return nil, ErrNotFound
}

func (m *orderRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, o := range m.orders {
		if o.OrderID == id {
			m.orders = append(m.orders[:i], m.orders[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestOrderService(t *testing.T) {
	t.Run("List returns orders", func(t *testing.T) {
		repo := newOrderRepoMock([]domain.Order{
			{OrderID: "ord-1", Side: "buy", Status: "pending"},
			{OrderID: "ord-2", Side: "sell", Status: "filled"},
		})
		svc := NewOrderService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns order", func(t *testing.T) {
		repo := newOrderRepoMock([]domain.Order{
			{OrderID: "ord-1", Side: "buy", Status: "pending"},
		})
		svc := NewOrderService(repo)

		result, err := svc.GetByID(context.Background(), "ord-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.Side != "buy" {
			t.Errorf("Side = %q; want buy", result.Side)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newOrderRepoMock(nil)
		svc := NewOrderService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds order", func(t *testing.T) {
		repo := newOrderRepoMock(nil)
		svc := NewOrderService(repo)
		now := time.Now()
		order := &domain.Order{OrderID: "ord-new", Side: "buy", Status: "pending", CreatedAt: now}

		result, err := svc.Create(context.Background(), order)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.OrderID != "ord-new" {
			t.Errorf("OrderID = %q; want ord-new", result.OrderID)
		}
	})

	t.Run("CreateBatch adds multiple orders", func(t *testing.T) {
		repo := newOrderRepoMock(nil)
		svc := NewOrderService(repo)
		entities := []domain.Order{
			{OrderID: "ord-1", Side: "buy"},
			{OrderID: "ord-2", Side: "sell"},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies order", func(t *testing.T) {
		repo := newOrderRepoMock([]domain.Order{
			{OrderID: "ord-1", Side: "buy", Status: "pending"},
		})
		svc := NewOrderService(repo)
		updated := &domain.Order{OrderID: "ord-1", Side: "buy", Status: "filled"}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Status != "filled" {
			t.Errorf("Status = %q; want filled", result.Status)
		}
	})

	t.Run("Delete removes order", func(t *testing.T) {
		repo := newOrderRepoMock([]domain.Order{
			{OrderID: "ord-1", Side: "buy"},
		})
		svc := NewOrderService(repo)

		ok, err := svc.Delete(context.Background(), "ord-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newOrderRepoMock(nil)
		svc := NewOrderService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})

	t.Run("Create returns error on repo failure", func(t *testing.T) {
		repo := &orderRepoMock{err: errors.New("repo error")}
		svc := NewOrderService(repo)
		order := &domain.Order{OrderID: "ord-new", Side: "buy"}

		_, err := svc.Create(context.Background(), order)

		if err == nil {
			t.Error("Create() error = nil; want repo error")
		}
	})
}
