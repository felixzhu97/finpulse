package application

import (
	"context"
	"errors"
	"testing"

	"finpulse/server-go/internal/domain"
)

// accountRepoMock implements AccountRepo for testing
type accountRepoMock struct {
	accounts []domain.Account
	byID     map[string]*domain.Account
	err      error
}

func newAccountRepoMock(accounts []domain.Account) *accountRepoMock {
	m := &accountRepoMock{
		accounts: accounts,
		byID:     make(map[string]*domain.Account),
	}
	for i := range accounts {
		m.byID[accounts[i].AccountID] = &accounts[i]
	}
	return m
}

func (m *accountRepoMock) List(ctx context.Context, limit, offset int) ([]domain.Account, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.accounts, nil
}

func (m *accountRepoMock) GetByID(ctx context.Context, accountID string) (*domain.Account, error) {
	if m.err != nil {
		return nil, m.err
	}
	if a, ok := m.byID[accountID]; ok {
		return a, nil
	}
	return nil, ErrNotFound
}

func (m *accountRepoMock) Add(ctx context.Context, a *domain.Account) (*domain.Account, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[a.AccountID] = a
	m.accounts = append(m.accounts, *a)
	return a, nil
}

func (m *accountRepoMock) AddMany(ctx context.Context, entities []domain.Account) ([]domain.Account, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].AccountID] = &entities[i]
	}
	m.accounts = append(m.accounts, entities...)
	return entities, nil
}

func (m *accountRepoMock) Save(ctx context.Context, a *domain.Account) (*domain.Account, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[a.AccountID] = a
	for i, acc := range m.accounts {
		if acc.AccountID == a.AccountID {
			m.accounts[i] = *a
			return a, nil
		}
	}
	return nil, ErrNotFound
}

func (m *accountRepoMock) Remove(ctx context.Context, accountID string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[accountID]; !ok {
		return false, nil
	}
	delete(m.byID, accountID)
	for i, acc := range m.accounts {
		if acc.AccountID == accountID {
			m.accounts = append(m.accounts[:i], m.accounts[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestAccountService(t *testing.T) {
	t.Run("List returns accounts", func(t *testing.T) {
		repo := newAccountRepoMock([]domain.Account{
			{AccountID: "acc-1", AccountType: "trading"},
			{AccountID: "acc-2", AccountType: "savings"},
		})
		svc := NewAccountService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns account", func(t *testing.T) {
		repo := newAccountRepoMock([]domain.Account{
			{AccountID: "acc-1", AccountType: "trading"},
		})
		svc := NewAccountService(repo)

		result, err := svc.GetByID(context.Background(), "acc-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.AccountType != "trading" {
			t.Errorf("AccountType = %q; want trading", result.AccountType)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newAccountRepoMock(nil)
		svc := NewAccountService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds account", func(t *testing.T) {
		repo := newAccountRepoMock(nil)
		svc := NewAccountService(repo)
		account := &domain.Account{AccountID: "new-acc", AccountType: "trading"}

		result, err := svc.Create(context.Background(), account)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.AccountID != "new-acc" {
			t.Errorf("AccountID = %q; want new-acc", result.AccountID)
		}
	})

	t.Run("CreateBatch adds multiple accounts", func(t *testing.T) {
		repo := newAccountRepoMock(nil)
		svc := NewAccountService(repo)
		entities := []domain.Account{
			{AccountID: "acc-1", AccountType: "trading"},
			{AccountID: "acc-2", AccountType: "savings"},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies account", func(t *testing.T) {
		repo := newAccountRepoMock([]domain.Account{
			{AccountID: "acc-1", AccountType: "trading", Status: "active"},
		})
		svc := NewAccountService(repo)
		updated := &domain.Account{AccountID: "acc-1", AccountType: "savings", Status: "suspended"}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.AccountType != "savings" {
			t.Errorf("AccountType = %q; want savings", result.AccountType)
		}
	})

	t.Run("Delete removes account", func(t *testing.T) {
		repo := newAccountRepoMock([]domain.Account{
			{AccountID: "acc-1", AccountType: "trading"},
		})
		svc := NewAccountService(repo)

		ok, err := svc.Delete(context.Background(), "acc-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newAccountRepoMock(nil)
		svc := NewAccountService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
