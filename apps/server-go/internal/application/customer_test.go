package application

import (
	"context"
	"errors"
	"testing"

	"finpulse/server-go/internal/domain"
)

// customerRepoMock implements CustomerRepo for testing
type customerRepoMock struct {
	customers []domain.Customer
	byID      map[string]*domain.Customer
	err       error
}

func newCustomerRepoMock(customers []domain.Customer) *customerRepoMock {
	m := &customerRepoMock{
		customers: customers,
		byID:      make(map[string]*domain.Customer),
	}
	for i := range customers {
		m.byID[customers[i].CustomerID] = &customers[i]
	}
	return m
}

func (m *customerRepoMock) List(ctx context.Context, limit, offset int) ([]domain.Customer, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.customers, nil
}

func (m *customerRepoMock) GetByID(ctx context.Context, customerID string) (*domain.Customer, error) {
	if m.err != nil {
		return nil, m.err
	}
	if c, ok := m.byID[customerID]; ok {
		return c, nil
	}
	return nil, ErrNotFound
}

func (m *customerRepoMock) Insert(ctx context.Context, name string, email *string, kycStatus *string) (*domain.Customer, error) {
	if m.err != nil {
		return nil, m.err
	}
	c := &domain.Customer{
		CustomerID: "generated-id",
		Name:       name,
		Email:     email,
		KYCStatus: kycStatus,
	}
	m.byID[c.CustomerID] = c
	m.customers = append(m.customers, *c)
	return c, nil
}

func (m *customerRepoMock) Add(ctx context.Context, c *domain.Customer) (*domain.Customer, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[c.CustomerID] = c
	m.customers = append(m.customers, *c)
	return c, nil
}

func (m *customerRepoMock) AddMany(ctx context.Context, entities []domain.Customer) ([]domain.Customer, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].CustomerID] = &entities[i]
	}
	m.customers = append(m.customers, entities...)
	return entities, nil
}

func (m *customerRepoMock) Save(ctx context.Context, c *domain.Customer) (*domain.Customer, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[c.CustomerID] = c
	for i, cust := range m.customers {
		if cust.CustomerID == c.CustomerID {
			m.customers[i] = *c
			return c, nil
		}
	}
	return nil, ErrNotFound
}

func (m *customerRepoMock) Remove(ctx context.Context, customerID string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[customerID]; !ok {
		return false, nil
	}
	delete(m.byID, customerID)
	for i, cust := range m.customers {
		if cust.CustomerID == customerID {
			m.customers = append(m.customers[:i], m.customers[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestCustomerService(t *testing.T) {
	t.Run("List returns customers", func(t *testing.T) {
		repo := newCustomerRepoMock([]domain.Customer{
			{CustomerID: "cust-1", Name: "Customer 1"},
			{CustomerID: "cust-2", Name: "Customer 2"},
		})
		svc := NewCustomerService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns customer", func(t *testing.T) {
		repo := newCustomerRepoMock([]domain.Customer{
			{CustomerID: "cust-1", Name: "Test Customer"},
		})
		svc := NewCustomerService(repo)

		result, err := svc.GetByID(context.Background(), "cust-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.Name != "Test Customer" {
			t.Errorf("Name = %q; want Test Customer", result.Name)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newCustomerRepoMock(nil)
		svc := NewCustomerService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds customer", func(t *testing.T) {
		repo := newCustomerRepoMock(nil)
		svc := NewCustomerService(repo)
		customer := &domain.Customer{CustomerID: "new-cust", Name: "New Customer"}

		result, err := svc.Create(context.Background(), customer)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.CustomerID != "new-cust" {
			t.Errorf("CustomerID = %q; want new-cust", result.CustomerID)
		}
	})

	t.Run("CreateBatch adds multiple customers", func(t *testing.T) {
		repo := newCustomerRepoMock(nil)
		svc := NewCustomerService(repo)
		entities := []domain.Customer{
			{CustomerID: "cust-1", Name: "A"},
			{CustomerID: "cust-2", Name: "B"},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies customer", func(t *testing.T) {
		repo := newCustomerRepoMock([]domain.Customer{
			{CustomerID: "cust-1", Name: "Old Name"},
		})
		svc := NewCustomerService(repo)
		updated := &domain.Customer{CustomerID: "cust-1", Name: "New Name"}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Name != "New Name" {
			t.Errorf("Name = %q; want New Name", result.Name)
		}
	})

	t.Run("Delete removes customer", func(t *testing.T) {
		repo := newCustomerRepoMock([]domain.Customer{
			{CustomerID: "cust-1", Name: "To Delete"},
		})
		svc := NewCustomerService(repo)

		ok, err := svc.Delete(context.Background(), "cust-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newCustomerRepoMock(nil)
		svc := NewCustomerService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
