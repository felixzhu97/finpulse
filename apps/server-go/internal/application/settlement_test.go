package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"finpulse/server-go/internal/domain"
)

type settlementRepoMock struct {
	settlements []domain.Settlement
	byID       map[string]*domain.Settlement
	err        error
}

func newSettlementRepoMock(settlements []domain.Settlement) *settlementRepoMock {
	m := &settlementRepoMock{
		settlements: settlements,
		byID:       make(map[string]*domain.Settlement),
	}
	for i := range settlements {
		m.byID[settlements[i].SettlementID] = &settlements[i]
	}
	return m
}

func (m *settlementRepoMock) List(ctx context.Context, limit, offset int) ([]domain.Settlement, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.settlements, nil
}

func (m *settlementRepoMock) GetByID(ctx context.Context, id string) (*domain.Settlement, error) {
	if m.err != nil {
		return nil, m.err
	}
	if s, ok := m.byID[id]; ok {
		return s, nil
	}
	return nil, ErrNotFound
}

func (m *settlementRepoMock) Add(ctx context.Context, s *domain.Settlement) (*domain.Settlement, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[s.SettlementID] = s
	m.settlements = append(m.settlements, *s)
	return s, nil
}

func (m *settlementRepoMock) AddMany(ctx context.Context, entities []domain.Settlement) ([]domain.Settlement, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].SettlementID] = &entities[i]
	}
	m.settlements = append(m.settlements, entities...)
	return entities, nil
}

func (m *settlementRepoMock) Save(ctx context.Context, s *domain.Settlement) (*domain.Settlement, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[s.SettlementID] = s
	for i, settlement := range m.settlements {
		if settlement.SettlementID == s.SettlementID {
			m.settlements[i] = *s
			return s, nil
		}
	}
	return nil, ErrNotFound
}

func (m *settlementRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, s := range m.settlements {
		if s.SettlementID == id {
			m.settlements = append(m.settlements[:i], m.settlements[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestSettlementService(t *testing.T) {
	t.Run("List returns settlements", func(t *testing.T) {
		repo := newSettlementRepoMock([]domain.Settlement{
			{SettlementID: "stl-1", Status: "pending"},
			{SettlementID: "stl-2", Status: "settled"},
		})
		svc := NewSettlementService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns settlement", func(t *testing.T) {
		repo := newSettlementRepoMock([]domain.Settlement{
			{SettlementID: "stl-1", Status: "settled"},
		})
		svc := NewSettlementService(repo)

		result, err := svc.GetByID(context.Background(), "stl-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.Status != "settled" {
			t.Errorf("Status = %q; want settled", result.Status)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newSettlementRepoMock(nil)
		svc := NewSettlementService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds settlement", func(t *testing.T) {
		repo := newSettlementRepoMock(nil)
		svc := NewSettlementService(repo)
		settlement := &domain.Settlement{SettlementID: "stl-new", Status: "pending"}

		result, err := svc.Create(context.Background(), settlement)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.SettlementID != "stl-new" {
			t.Errorf("SettlementID = %q; want stl-new", result.SettlementID)
		}
	})

	t.Run("CreateBatch adds multiple settlements", func(t *testing.T) {
		repo := newSettlementRepoMock(nil)
		svc := NewSettlementService(repo)
		entities := []domain.Settlement{
			{SettlementID: "stl-1", Status: "pending"},
			{SettlementID: "stl-2", Status: "pending"},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies settlement", func(t *testing.T) {
		now := time.Now()
		repo := newSettlementRepoMock([]domain.Settlement{
			{SettlementID: "stl-1", Status: "pending", SettledAt: nil},
		})
		svc := NewSettlementService(repo)
		updated := &domain.Settlement{SettlementID: "stl-1", Status: "settled", SettledAt: &now}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Status != "settled" {
			t.Errorf("Status = %q; want settled", result.Status)
		}
	})

	t.Run("Delete removes settlement", func(t *testing.T) {
		repo := newSettlementRepoMock([]domain.Settlement{
			{SettlementID: "stl-1", Status: "pending"},
		})
		svc := NewSettlementService(repo)

		ok, err := svc.Delete(context.Background(), "stl-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newSettlementRepoMock(nil)
		svc := NewSettlementService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
