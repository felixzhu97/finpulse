package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"finpulse/server-go/internal/domain"
)

type paymentRepoMock struct {
	payments []domain.Payment
	byID    map[string]*domain.Payment
	err     error
}

func newPaymentRepoMock(payments []domain.Payment) *paymentRepoMock {
	m := &paymentRepoMock{
		payments: payments,
		byID:    make(map[string]*domain.Payment),
	}
	for i := range payments {
		m.byID[payments[i].PaymentID] = &payments[i]
	}
	return m
}

func (m *paymentRepoMock) List(ctx context.Context, limit, offset int) ([]domain.Payment, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.payments, nil
}

func (m *paymentRepoMock) GetByID(ctx context.Context, id string) (*domain.Payment, error) {
	if m.err != nil {
		return nil, m.err
	}
	if p, ok := m.byID[id]; ok {
		return p, nil
	}
	return nil, ErrNotFound
}

func (m *paymentRepoMock) Add(ctx context.Context, p *domain.Payment) (*domain.Payment, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[p.PaymentID] = p
	m.payments = append(m.payments, *p)
	return p, nil
}

func (m *paymentRepoMock) AddMany(ctx context.Context, entities []domain.Payment) ([]domain.Payment, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].PaymentID] = &entities[i]
	}
	m.payments = append(m.payments, entities...)
	return entities, nil
}

func (m *paymentRepoMock) Save(ctx context.Context, p *domain.Payment) (*domain.Payment, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[p.PaymentID] = p
	for i, payment := range m.payments {
		if payment.PaymentID == p.PaymentID {
			m.payments[i] = *p
			return p, nil
		}
	}
	return nil, ErrNotFound
}

func (m *paymentRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, p := range m.payments {
		if p.PaymentID == id {
			m.payments = append(m.payments[:i], m.payments[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestPaymentService(t *testing.T) {
	t.Run("List returns payments", func(t *testing.T) {
		repo := newPaymentRepoMock([]domain.Payment{
			{PaymentID: "pmt-1", Amount: 100.0, Status: "completed"},
			{PaymentID: "pmt-2", Amount: 200.0, Status: "pending"},
		})
		svc := NewPaymentService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns payment", func(t *testing.T) {
		repo := newPaymentRepoMock([]domain.Payment{
			{PaymentID: "pmt-1", Amount: 100.0, Status: "completed"},
		})
		svc := NewPaymentService(repo)

		result, err := svc.GetByID(context.Background(), "pmt-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.Amount != 100.0 {
			t.Errorf("Amount = %v; want 100.0", result.Amount)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newPaymentRepoMock(nil)
		svc := NewPaymentService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds payment", func(t *testing.T) {
		repo := newPaymentRepoMock(nil)
		svc := NewPaymentService(repo)
		now := time.Now()
		payment := &domain.Payment{PaymentID: "pmt-new", Amount: 500.0, Status: "pending", CreatedAt: now}

		result, err := svc.Create(context.Background(), payment)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.PaymentID != "pmt-new" {
			t.Errorf("PaymentID = %q; want pmt-new", result.PaymentID)
		}
	})

	t.Run("CreateBatch adds multiple payments", func(t *testing.T) {
		repo := newPaymentRepoMock(nil)
		svc := NewPaymentService(repo)
		entities := []domain.Payment{
			{PaymentID: "pmt-1", Amount: 100.0},
			{PaymentID: "pmt-2", Amount: 200.0},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies payment", func(t *testing.T) {
		repo := newPaymentRepoMock([]domain.Payment{
			{PaymentID: "pmt-1", Amount: 100.0, Status: "pending"},
		})
		svc := NewPaymentService(repo)
		updated := &domain.Payment{PaymentID: "pmt-1", Amount: 100.0, Status: "completed"}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Status != "completed" {
			t.Errorf("Status = %q; want completed", result.Status)
		}
	})

	t.Run("Delete removes payment", func(t *testing.T) {
		repo := newPaymentRepoMock([]domain.Payment{
			{PaymentID: "pmt-1", Amount: 100.0},
		})
		svc := NewPaymentService(repo)

		ok, err := svc.Delete(context.Background(), "pmt-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newPaymentRepoMock(nil)
		svc := NewPaymentService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
