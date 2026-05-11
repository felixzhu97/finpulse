package application

import (
	"context"
	"errors"
	"testing"

	"finpulse/server-go/internal/domain"
)

type mockInstrumentRepo struct {
	instruments []domain.Instrument
	err        error
}

func (m *mockInstrumentRepo) List(ctx context.Context, limit, offset int) ([]domain.Instrument, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.instruments, nil
}

func (m *mockInstrumentRepo) GetByID(ctx context.Context, instrumentID string) (*domain.Instrument, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range m.instruments {
		if m.instruments[i].InstrumentID == instrumentID {
			return &m.instruments[i], nil
		}
	}
	return nil, ErrNotFound
}

func (m *mockInstrumentRepo) Add(ctx context.Context, i *domain.Instrument) (*domain.Instrument, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.instruments = append(m.instruments, *i)
	return i, nil
}

func (m *mockInstrumentRepo) AddMany(ctx context.Context, entities []domain.Instrument) ([]domain.Instrument, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.instruments = append(m.instruments, entities...)
	return entities, nil
}

func (m *mockInstrumentRepo) Save(ctx context.Context, i *domain.Instrument) (*domain.Instrument, error) {
	if m.err != nil {
		return nil, m.err
	}
	for idx, inst := range m.instruments {
		if inst.InstrumentID == i.InstrumentID {
			m.instruments[idx] = *i
			return i, nil
		}
	}
	return nil, ErrNotFound
}

func (m *mockInstrumentRepo) Remove(ctx context.Context, instrumentID string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	for i, inst := range m.instruments {
		if inst.InstrumentID == instrumentID {
			m.instruments = append(m.instruments[:i], m.instruments[i+1:]...)
			return true, nil
		}
	}
	return false, nil
}

func TestInstrumentsService(t *testing.T) {
	t.Run("List returns instruments", func(t *testing.T) {
		repo := &mockInstrumentRepo{
			instruments: []domain.Instrument{
				{InstrumentID: "inst-1", Symbol: "AAPL"},
				{InstrumentID: "inst-2", Symbol: "GOOGL"},
			},
		}
		svc := NewInstrumentsService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns instrument", func(t *testing.T) {
		repo := &mockInstrumentRepo{
			instruments: []domain.Instrument{
				{InstrumentID: "inst-1", Symbol: "AAPL"},
			},
		}
		svc := NewInstrumentsService(repo)

		result, err := svc.GetByID(context.Background(), "inst-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.Symbol != "AAPL" {
			t.Errorf("Symbol = %q; want AAPL", result.Symbol)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := &mockInstrumentRepo{}
		svc := NewInstrumentsService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds instrument", func(t *testing.T) {
		repo := &mockInstrumentRepo{}
		svc := NewInstrumentsService(repo)
		inst := &domain.Instrument{InstrumentID: "new-inst", Symbol: "MSFT"}

		result, err := svc.Create(context.Background(), inst)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.InstrumentID != "new-inst" {
			t.Errorf("InstrumentID = %q; want new-inst", result.InstrumentID)
		}
	})

	t.Run("CreateBatch adds multiple instruments", func(t *testing.T) {
		repo := &mockInstrumentRepo{}
		svc := NewInstrumentsService(repo)
		entities := []domain.Instrument{
			{InstrumentID: "inst-1", Symbol: "A"},
			{InstrumentID: "inst-2", Symbol: "B"},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies instrument", func(t *testing.T) {
		repo := &mockInstrumentRepo{
			instruments: []domain.Instrument{
				{InstrumentID: "inst-1", Symbol: "OLD"},
			},
		}
		svc := NewInstrumentsService(repo)
		updated := &domain.Instrument{InstrumentID: "inst-1", Symbol: "NEW"}

		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Symbol != "NEW" {
			t.Errorf("Symbol = %q; want NEW", result.Symbol)
		}
	})

	t.Run("Delete removes instrument", func(t *testing.T) {
		repo := &mockInstrumentRepo{
			instruments: []domain.Instrument{
				{InstrumentID: "inst-1", Symbol: "AAPL"},
			},
		}
		svc := NewInstrumentsService(repo)

		ok, err := svc.Delete(context.Background(), "inst-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := &mockInstrumentRepo{}
		svc := NewInstrumentsService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
