package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"finpulse/server-go/internal/domain"
)

type portfolioRepoMock struct {
	portfolios []domain.PortfolioSchema
	byID      map[string]*domain.PortfolioSchema
	err       error
}

func newPortfolioRepoMock(portfolios []domain.PortfolioSchema) *portfolioRepoMock {
	m := &portfolioRepoMock{
		portfolios: portfolios,
		byID:      make(map[string]*domain.PortfolioSchema),
	}
	for i := range portfolios {
		m.byID[portfolios[i].PortfolioID] = &portfolios[i]
	}
	return m
}

func (m *portfolioRepoMock) List(ctx context.Context, limit, offset int) ([]domain.PortfolioSchema, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.portfolios, nil
}

func (m *portfolioRepoMock) GetByID(ctx context.Context, id string) (*domain.PortfolioSchema, error) {
	if m.err != nil {
		return nil, m.err
	}
	if p, ok := m.byID[id]; ok {
		return p, nil
	}
	return nil, ErrNotFound
}

func (m *portfolioRepoMock) Add(ctx context.Context, p *domain.PortfolioSchema) (*domain.PortfolioSchema, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[p.PortfolioID] = p
	m.portfolios = append(m.portfolios, *p)
	return p, nil
}

func (m *portfolioRepoMock) AddMany(ctx context.Context, entities []domain.PortfolioSchema) ([]domain.PortfolioSchema, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].PortfolioID] = &entities[i]
	}
	m.portfolios = append(m.portfolios, entities...)
	return entities, nil
}

func (m *portfolioRepoMock) Save(ctx context.Context, p *domain.PortfolioSchema) (*domain.PortfolioSchema, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[p.PortfolioID] = p
	for i, port := range m.portfolios {
		if port.PortfolioID == p.PortfolioID {
			m.portfolios[i] = *p
			return p, nil
		}
	}
	return nil, ErrNotFound
}

func (m *portfolioRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, p := range m.portfolios {
		if p.PortfolioID == id {
			m.portfolios = append(m.portfolios[:i], m.portfolios[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestPortfolioService(t *testing.T) {
	t.Run("List returns portfolios", func(t *testing.T) {
		repo := newPortfolioRepoMock([]domain.PortfolioSchema{
			{PortfolioID: "pf-1", Name: "Growth Portfolio"},
			{PortfolioID: "pf-2", Name: "Income Portfolio"},
		})
		svc := NewPortfolioService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns portfolio", func(t *testing.T) {
		repo := newPortfolioRepoMock([]domain.PortfolioSchema{
			{PortfolioID: "pf-1", Name: "Growth Portfolio"},
		})
		svc := NewPortfolioService(repo)

		result, err := svc.GetByID(context.Background(), "pf-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.Name != "Growth Portfolio" {
			t.Errorf("Name = %q; want Growth Portfolio", result.Name)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newPortfolioRepoMock(nil)
		svc := NewPortfolioService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds portfolio", func(t *testing.T) {
		repo := newPortfolioRepoMock(nil)
		svc := NewPortfolioService(repo)
		now := time.Now()
		portfolio := &domain.PortfolioSchema{PortfolioID: "pf-new", Name: "New Portfolio", CreatedAt: now}

		result, err := svc.Create(context.Background(), portfolio)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.PortfolioID != "pf-new" {
			t.Errorf("PortfolioID = %q; want pf-new", result.PortfolioID)
		}
	})

	t.Run("CreateBatch adds multiple portfolios", func(t *testing.T) {
		repo := newPortfolioRepoMock(nil)
		svc := NewPortfolioService(repo)
		entities := []domain.PortfolioSchema{
			{PortfolioID: "pf-1", Name: "Growth Portfolio"},
			{PortfolioID: "pf-2", Name: "Income Portfolio"},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies portfolio", func(t *testing.T) {
		repo := newPortfolioRepoMock([]domain.PortfolioSchema{
			{PortfolioID: "pf-1", Name: "Old Name"},
		})
		svc := NewPortfolioService(repo)
		updated := &domain.PortfolioSchema{PortfolioID: "pf-1", Name: "New Name"}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Name != "New Name" {
			t.Errorf("Name = %q; want New Name", result.Name)
		}
	})

	t.Run("Delete removes portfolio", func(t *testing.T) {
		repo := newPortfolioRepoMock([]domain.PortfolioSchema{
			{PortfolioID: "pf-1", Name: "Growth Portfolio"},
		})
		svc := NewPortfolioService(repo)

		ok, err := svc.Delete(context.Background(), "pf-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newPortfolioRepoMock(nil)
		svc := NewPortfolioService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})

	t.Run("Create returns error on repo failure", func(t *testing.T) {
		repo := &portfolioRepoMock{err: errors.New("repo error")}
		svc := NewPortfolioService(repo)
		portfolio := &domain.PortfolioSchema{PortfolioID: "pf-new", Name: "New Portfolio"}

		_, err := svc.Create(context.Background(), portfolio)

		if err == nil {
			t.Error("Create() error = nil; want repo error")
		}
	})
}
