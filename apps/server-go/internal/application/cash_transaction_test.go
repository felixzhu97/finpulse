package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"finpulse/server-go/internal/domain"
)

type cashTransactionRepoMock struct {
	transactions []domain.CashTransaction
	byID       map[string]*domain.CashTransaction
	err        error
}

func newCashTransactionRepoMock(transactions []domain.CashTransaction) *cashTransactionRepoMock {
	m := &cashTransactionRepoMock{
		transactions: transactions,
		byID:       make(map[string]*domain.CashTransaction),
	}
	for i := range transactions {
		m.byID[transactions[i].TransactionID] = &transactions[i]
	}
	return m
}

func (m *cashTransactionRepoMock) List(ctx context.Context, limit, offset int) ([]domain.CashTransaction, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.transactions, nil
}

func (m *cashTransactionRepoMock) GetByID(ctx context.Context, id string) (*domain.CashTransaction, error) {
	if m.err != nil {
		return nil, m.err
	}
	if tx, ok := m.byID[id]; ok {
		return tx, nil
	}
	return nil, ErrNotFound
}

func (m *cashTransactionRepoMock) Add(ctx context.Context, tx *domain.CashTransaction) (*domain.CashTransaction, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[tx.TransactionID] = tx
	m.transactions = append(m.transactions, *tx)
	return tx, nil
}

func (m *cashTransactionRepoMock) AddMany(ctx context.Context, entities []domain.CashTransaction) ([]domain.CashTransaction, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].TransactionID] = &entities[i]
	}
	m.transactions = append(m.transactions, entities...)
	return entities, nil
}

func (m *cashTransactionRepoMock) Save(ctx context.Context, tx *domain.CashTransaction) (*domain.CashTransaction, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[tx.TransactionID] = tx
	for i, t := range m.transactions {
		if t.TransactionID == tx.TransactionID {
			m.transactions[i] = *tx
			return tx, nil
		}
	}
	return nil, ErrNotFound
}

func (m *cashTransactionRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, tx := range m.transactions {
		if tx.TransactionID == id {
			m.transactions = append(m.transactions[:i], m.transactions[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestCashTransactionService(t *testing.T) {
	t.Run("List returns transactions", func(t *testing.T) {
		repo := newCashTransactionRepoMock([]domain.CashTransaction{
			{TransactionID: "tx-1", Type: "deposit", Amount: 1000.0},
			{TransactionID: "tx-2", Type: "withdrawal", Amount: 500.0},
		})
		svc := NewCashTransactionService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns transaction", func(t *testing.T) {
		repo := newCashTransactionRepoMock([]domain.CashTransaction{
			{TransactionID: "tx-1", Type: "deposit", Amount: 1000.0},
		})
		svc := NewCashTransactionService(repo)

		result, err := svc.GetByID(context.Background(), "tx-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.Type != "deposit" {
			t.Errorf("Type = %q; want deposit", result.Type)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newCashTransactionRepoMock(nil)
		svc := NewCashTransactionService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds transaction", func(t *testing.T) {
		repo := newCashTransactionRepoMock(nil)
		svc := NewCashTransactionService(repo)
		now := time.Now()
		tx := &domain.CashTransaction{TransactionID: "tx-new", Type: "deposit", Amount: 2000.0, CreatedAt: now}

		result, err := svc.Create(context.Background(), tx)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.TransactionID != "tx-new" {
			t.Errorf("TransactionID = %q; want tx-new", result.TransactionID)
		}
	})

	t.Run("CreateBatch adds multiple transactions", func(t *testing.T) {
		repo := newCashTransactionRepoMock(nil)
		svc := NewCashTransactionService(repo)
		entities := []domain.CashTransaction{
			{TransactionID: "tx-1", Type: "deposit", Amount: 1000.0},
			{TransactionID: "tx-2", Type: "withdrawal", Amount: 500.0},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies transaction", func(t *testing.T) {
		repo := newCashTransactionRepoMock([]domain.CashTransaction{
			{TransactionID: "tx-1", Type: "deposit", Status: "pending"},
		})
		svc := NewCashTransactionService(repo)
		updated := &domain.CashTransaction{TransactionID: "tx-1", Type: "deposit", Status: "completed"}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Status != "completed" {
			t.Errorf("Status = %q; want completed", result.Status)
		}
	})

	t.Run("Delete removes transaction", func(t *testing.T) {
		repo := newCashTransactionRepoMock([]domain.CashTransaction{
			{TransactionID: "tx-1", Type: "deposit"},
		})
		svc := NewCashTransactionService(repo)

		ok, err := svc.Delete(context.Background(), "tx-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newCashTransactionRepoMock(nil)
		svc := NewCashTransactionService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
