package application

import (
	"context"
	"errors"
	"testing"

	"finpulse/server-go/internal/domain"
)

type bondRepoMock struct {
	bonds []domain.Bond
	byID  map[string]*domain.Bond
	err   error
}

func newBondRepoMock(bonds []domain.Bond) *bondRepoMock {
	m := &bondRepoMock{
		bonds: bonds,
		byID:  make(map[string]*domain.Bond),
	}
	for i := range bonds {
		m.byID[bonds[i].BondID] = &bonds[i]
	}
	return m
}

func (m *bondRepoMock) List(ctx context.Context, limit, offset int) ([]domain.Bond, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.bonds, nil
}

func (m *bondRepoMock) GetByID(ctx context.Context, id string) (*domain.Bond, error) {
	if m.err != nil {
		return nil, m.err
	}
	if b, ok := m.byID[id]; ok {
		return b, nil
	}
	return nil, ErrNotFound
}

func (m *bondRepoMock) Add(ctx context.Context, b *domain.Bond) (*domain.Bond, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[b.BondID] = b
	m.bonds = append(m.bonds, *b)
	return b, nil
}

func (m *bondRepoMock) AddMany(ctx context.Context, entities []domain.Bond) ([]domain.Bond, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].BondID] = &entities[i]
	}
	m.bonds = append(m.bonds, entities...)
	return entities, nil
}

func (m *bondRepoMock) Save(ctx context.Context, b *domain.Bond) (*domain.Bond, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[b.BondID] = b
	for i, bond := range m.bonds {
		if bond.BondID == b.BondID {
			m.bonds[i] = *b
			return b, nil
		}
	}
	return nil, ErrNotFound
}

func (m *bondRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, b := range m.bonds {
		if b.BondID == id {
			m.bonds = append(m.bonds[:i], m.bonds[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestBondService(t *testing.T) {
	t.Run("List returns bonds", func(t *testing.T) {
		fv1, fv2 := 1000.0, 2000.0
		repo := newBondRepoMock([]domain.Bond{
			{BondID: "bond-1", InstrumentID: "INST1", FaceValue: &fv1},
			{BondID: "bond-2", InstrumentID: "INST2", FaceValue: &fv2},
		})
		svc := NewBondService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns bond", func(t *testing.T) {
		fv := 1000.0
		repo := newBondRepoMock([]domain.Bond{
			{BondID: "bond-1", InstrumentID: "INST1", FaceValue: &fv},
		})
		svc := NewBondService(repo)

		result, err := svc.GetByID(context.Background(), "bond-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.InstrumentID != "INST1" {
			t.Errorf("InstrumentID = %q; want INST1", result.InstrumentID)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newBondRepoMock(nil)
		svc := NewBondService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds bond", func(t *testing.T) {
		repo := newBondRepoMock(nil)
		svc := NewBondService(repo)
		fv := 1000.0
		bond := &domain.Bond{BondID: "bond-new", InstrumentID: "INST_NEW", FaceValue: &fv}

		result, err := svc.Create(context.Background(), bond)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.BondID != "bond-new" {
			t.Errorf("BondID = %q; want bond-new", result.BondID)
		}
	})

	t.Run("CreateBatch adds multiple bonds", func(t *testing.T) {
		repo := newBondRepoMock(nil)
		svc := NewBondService(repo)
		fv1, fv2 := 1000.0, 2000.0
		entities := []domain.Bond{
			{BondID: "bond-1", InstrumentID: "INST1", FaceValue: &fv1},
			{BondID: "bond-2", InstrumentID: "INST2", FaceValue: &fv2},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies bond", func(t *testing.T) {
		repo := newBondRepoMock(nil)
		svc := NewBondService(repo)
		fv1, fv2 := 1000.0, 1500.0
		existingBond := &domain.Bond{BondID: "bond-1", InstrumentID: "INST1", FaceValue: &fv1}
		svc.Create(context.Background(), existingBond)

		updated := &domain.Bond{BondID: "bond-1", InstrumentID: "INST1", FaceValue: &fv2}
		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if *result.FaceValue != 1500.0 {
			t.Errorf("FaceValue = %v; want 1500.0", *result.FaceValue)
		}
	})

	t.Run("Delete removes bond", func(t *testing.T) {
		fv := 1000.0
		repo := newBondRepoMock([]domain.Bond{
			{BondID: "bond-1", InstrumentID: "INST1", FaceValue: &fv},
		})
		svc := NewBondService(repo)

		ok, err := svc.Delete(context.Background(), "bond-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newBondRepoMock(nil)
		svc := NewBondService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
