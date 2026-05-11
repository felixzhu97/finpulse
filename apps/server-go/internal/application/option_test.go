package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"finpulse/server-go/internal/domain"
)

type optionRepoMock struct {
	options []domain.Option
	byID   map[string]*domain.Option
	err    error
}

func newOptionRepoMock(options []domain.Option) *optionRepoMock {
	m := &optionRepoMock{
		options: options,
		byID:   make(map[string]*domain.Option),
	}
	for i := range options {
		m.byID[options[i].OptionID] = &options[i]
	}
	return m
}

func (m *optionRepoMock) List(ctx context.Context, limit, offset int) ([]domain.Option, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.options, nil
}

func (m *optionRepoMock) GetByID(ctx context.Context, id string) (*domain.Option, error) {
	if m.err != nil {
		return nil, m.err
	}
	if o, ok := m.byID[id]; ok {
		return o, nil
	}
	return nil, ErrNotFound
}

func (m *optionRepoMock) Add(ctx context.Context, o *domain.Option) (*domain.Option, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[o.OptionID] = o
	m.options = append(m.options, *o)
	return o, nil
}

func (m *optionRepoMock) AddMany(ctx context.Context, entities []domain.Option) ([]domain.Option, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].OptionID] = &entities[i]
	}
	m.options = append(m.options, entities...)
	return entities, nil
}

func (m *optionRepoMock) Save(ctx context.Context, o *domain.Option) (*domain.Option, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[o.OptionID] = o
	for i, opt := range m.options {
		if opt.OptionID == o.OptionID {
			m.options[i] = *o
			return o, nil
		}
	}
	return nil, ErrNotFound
}

func (m *optionRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, o := range m.options {
		if o.OptionID == id {
			m.options = append(m.options[:i], m.options[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestOptionService(t *testing.T) {
	t.Run("List returns options", func(t *testing.T) {
		expiry := time.Now().AddDate(1, 0, 0)
		repo := newOptionRepoMock([]domain.Option{
			{OptionID: "opt-1", Strike: 150.0, Expiry: expiry},
			{OptionID: "opt-2", Strike: 200.0, Expiry: expiry},
		})
		svc := NewOptionService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns option", func(t *testing.T) {
		expiry := time.Now().AddDate(1, 0, 0)
		repo := newOptionRepoMock([]domain.Option{
			{OptionID: "opt-1", Strike: 150.0, Expiry: expiry},
		})
		svc := NewOptionService(repo)

		result, err := svc.GetByID(context.Background(), "opt-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if result.Strike != 150.0 {
			t.Errorf("Strike = %v; want 150.0", result.Strike)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newOptionRepoMock(nil)
		svc := NewOptionService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds option", func(t *testing.T) {
		repo := newOptionRepoMock(nil)
		svc := NewOptionService(repo)
		expiry := time.Now().AddDate(1, 0, 0)
		option := &domain.Option{OptionID: "opt-new", Strike: 100.0, Expiry: expiry}

		result, err := svc.Create(context.Background(), option)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.OptionID != "opt-new" {
			t.Errorf("OptionID = %q; want opt-new", result.OptionID)
		}
	})

	t.Run("CreateBatch adds multiple options", func(t *testing.T) {
		repo := newOptionRepoMock(nil)
		svc := NewOptionService(repo)
		expiry := time.Now().AddDate(1, 0, 0)
		entities := []domain.Option{
			{OptionID: "opt-1", Strike: 150.0, Expiry: expiry},
			{OptionID: "opt-2", Strike: 200.0, Expiry: expiry},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies option", func(t *testing.T) {
		repo := newOptionRepoMock(nil)
		svc := NewOptionService(repo)
		expiry := time.Now().AddDate(1, 0, 0)
		existing := &domain.Option{OptionID: "opt-1", Strike: 150.0, Expiry: expiry}
		svc.Create(context.Background(), existing)

		updated := &domain.Option{OptionID: "opt-1", Strike: 160.0, Expiry: expiry}
		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if result.Strike != 160.0 {
			t.Errorf("Strike = %v; want 160.0", result.Strike)
		}
	})

	t.Run("Delete removes option", func(t *testing.T) {
		expiry := time.Now().AddDate(1, 0, 0)
		repo := newOptionRepoMock([]domain.Option{
			{OptionID: "opt-1", Strike: 150.0, Expiry: expiry},
		})
		svc := NewOptionService(repo)

		ok, err := svc.Delete(context.Background(), "opt-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newOptionRepoMock(nil)
		svc := NewOptionService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
