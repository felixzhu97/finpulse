package application

import (
	"context"
	"errors"
	"testing"

	"finpulse/server-go/internal/domain"
)

type positionRepoMock struct {
	positions []domain.Position
	byID     map[string]*domain.Position
	err      error
}

func newPositionRepoMock(positions []domain.Position) *positionRepoMock {
	m := &positionRepoMock{
		positions: positions,
		byID:     make(map[string]*domain.Position),
	}
	for i := range positions {
		m.byID[positions[i].PositionID] = &positions[i]
	}
	return m
}

func (m *positionRepoMock) List(ctx context.Context, limit, offset int) ([]domain.Position, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.positions, nil
}

func (m *positionRepoMock) GetByID(ctx context.Context, id string) (*domain.Position, error) {
	if m.err != nil {
		return nil, m.err
	}
	if p, ok := m.byID[id]; ok {
		return p, nil
	}
	return nil, ErrNotFound
}

func (m *positionRepoMock) Add(ctx context.Context, p *domain.Position) (*domain.Position, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[p.PositionID] = p
	m.positions = append(m.positions, *p)
	return p, nil
}

func (m *positionRepoMock) AddMany(ctx context.Context, entities []domain.Position) ([]domain.Position, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].PositionID] = &entities[i]
	}
	m.positions = append(m.positions, entities...)
	return entities, nil
}

func (m *positionRepoMock) Save(ctx context.Context, p *domain.Position) (*domain.Position, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[p.PositionID] = p
	for i, pos := range m.positions {
		if pos.PositionID == p.PositionID {
			m.positions[i] = *p
			return p, nil
		}
	}
	return nil, ErrNotFound
}

func (m *positionRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, p := range m.positions {
		if p.PositionID == id {
			m.positions = append(m.positions[:i], m.positions[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestPositionService(t *testing.T) {
	t.Run("List returns positions", func(t *testing.T) {
		cb := 150.0
		repo := newPositionRepoMock([]domain.Position{
			{PositionID: "pos-1", Quantity: 100, CostBasis: &cb},
			{PositionID: "pos-2", Quantity: 50, CostBasis: nil},
		})
		svc := NewPositionService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns position", func(t *testing.T) {
		cb := 150.0
		repo := newPositionRepoMock([]domain.Position{
			{PositionID: "pos-1", Quantity: 100, CostBasis: &cb},
		})
		svc := NewPositionService(repo)

		result, err := svc.GetByID(context.Background(), "pos-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.Quantity != 100 {
			t.Errorf("Quantity = %v; want 100", result.Quantity)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newPositionRepoMock(nil)
		svc := NewPositionService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds position", func(t *testing.T) {
		repo := newPositionRepoMock(nil)
		svc := NewPositionService(repo)
		cb := 150.0
		position := &domain.Position{PositionID: "pos-new", Quantity: 100, CostBasis: &cb}

		result, err := svc.Create(context.Background(), position)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.PositionID != "pos-new" {
			t.Errorf("PositionID = %q; want pos-new", result.PositionID)
		}
	})

	t.Run("CreateBatch adds multiple positions", func(t *testing.T) {
		repo := newPositionRepoMock(nil)
		svc := NewPositionService(repo)
		cb := 150.0
		entities := []domain.Position{
			{PositionID: "pos-1", Quantity: 100, CostBasis: &cb},
			{PositionID: "pos-2", Quantity: 50, CostBasis: nil},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies position", func(t *testing.T) {
		repo := newPositionRepoMock(nil)
		svc := NewPositionService(repo)
		cb1, cb2 := 150.0, 160.0
		existing := &domain.Position{PositionID: "pos-1", Quantity: 100, CostBasis: &cb1}
		svc.Create(context.Background(), existing)

		updated := &domain.Position{PositionID: "pos-1", Quantity: 150, CostBasis: &cb2}
		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Quantity != 150 {
			t.Errorf("Quantity = %v; want 150", result.Quantity)
		}
	})

	t.Run("Delete removes position", func(t *testing.T) {
		cb := 150.0
		repo := newPositionRepoMock([]domain.Position{
			{PositionID: "pos-1", Quantity: 100, CostBasis: &cb},
		})
		svc := NewPositionService(repo)

		ok, err := svc.Delete(context.Background(), "pos-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newPositionRepoMock(nil)
		svc := NewPositionService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
