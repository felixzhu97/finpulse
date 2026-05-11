package application

import (
	"context"
	"errors"
	"testing"

	"finpulse/server-go/internal/domain"
)

type userPreferenceRepoMock struct {
	preferences []domain.UserPreference
	byID       map[string]*domain.UserPreference
	err        error
}

func newUserPreferenceRepoMock(preferences []domain.UserPreference) *userPreferenceRepoMock {
	m := &userPreferenceRepoMock{
		preferences: preferences,
		byID:       make(map[string]*domain.UserPreference),
	}
	for i := range preferences {
		m.byID[preferences[i].PreferenceID] = &preferences[i]
	}
	return m
}

func (m *userPreferenceRepoMock) List(ctx context.Context, limit, offset int) ([]domain.UserPreference, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.preferences, nil
}

func (m *userPreferenceRepoMock) GetByID(ctx context.Context, id string) (*domain.UserPreference, error) {
	if m.err != nil {
		return nil, m.err
	}
	if p, ok := m.byID[id]; ok {
		return p, nil
	}
	return nil, ErrNotFound
}

func (m *userPreferenceRepoMock) Add(ctx context.Context, p *domain.UserPreference) (*domain.UserPreference, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[p.PreferenceID] = p
	m.preferences = append(m.preferences, *p)
	return p, nil
}

func (m *userPreferenceRepoMock) AddMany(ctx context.Context, entities []domain.UserPreference) ([]domain.UserPreference, error) {
	if m.err != nil {
		return nil, m.err
	}
	for i := range entities {
		m.byID[entities[i].PreferenceID] = &entities[i]
	}
	m.preferences = append(m.preferences, entities...)
	return entities, nil
}

func (m *userPreferenceRepoMock) Save(ctx context.Context, p *domain.UserPreference) (*domain.UserPreference, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.byID[p.PreferenceID] = p
	for i, pref := range m.preferences {
		if pref.PreferenceID == p.PreferenceID {
			m.preferences[i] = *p
			return p, nil
		}
	}
	return nil, ErrNotFound
}

func (m *userPreferenceRepoMock) Remove(ctx context.Context, id string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	if _, ok := m.byID[id]; !ok {
		return false, nil
	}
	delete(m.byID, id)
	for i, p := range m.preferences {
		if p.PreferenceID == id {
			m.preferences = append(m.preferences[:i], m.preferences[i+1:]...)
			return true, nil
		}
	}
	return true, nil
}

func TestUserPreferenceService(t *testing.T) {
	t.Run("List returns preferences", func(t *testing.T) {
		theme := "dark"
		lang := "en"
		repo := newUserPreferenceRepoMock([]domain.UserPreference{
			{PreferenceID: "pref-1", Theme: &theme},
			{PreferenceID: "pref-2", Language: &lang},
		})
		svc := NewUserPreferenceService(repo)

		result, err := svc.List(context.Background(), 100, 0)

		if err != nil {
			t.Errorf("List() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("GetByID returns preference", func(t *testing.T) {
		theme := "dark"
		repo := newUserPreferenceRepoMock([]domain.UserPreference{
			{PreferenceID: "pref-1", Theme: &theme},
		})
		svc := NewUserPreferenceService(repo)

		result, err := svc.GetByID(context.Background(), "pref-1")

		if err != nil {
			t.Errorf("GetByID() error = %v; want nil", err)
		}
		if *result.Theme != "dark" {
			t.Errorf("Theme = %q; want dark", *result.Theme)
		}
	})

	t.Run("GetByID returns not found", func(t *testing.T) {
		repo := newUserPreferenceRepoMock(nil)
		svc := NewUserPreferenceService(repo)

		_, err := svc.GetByID(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetByID() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("Create adds preference", func(t *testing.T) {
		repo := newUserPreferenceRepoMock(nil)
		svc := NewUserPreferenceService(repo)
		theme := "light"
		pref := &domain.UserPreference{PreferenceID: "pref-new", Theme: &theme}

		result, err := svc.Create(context.Background(), pref)

		if err != nil {
			t.Errorf("Create() error = %v; want nil", err)
		}
		if result.PreferenceID != "pref-new" {
			t.Errorf("PreferenceID = %q; want pref-new", result.PreferenceID)
		}
	})

	t.Run("CreateBatch adds multiple preferences", func(t *testing.T) {
		repo := newUserPreferenceRepoMock(nil)
		svc := NewUserPreferenceService(repo)
		theme := "dark"
		lang := "en"
		entities := []domain.UserPreference{
			{PreferenceID: "pref-1", Theme: &theme},
			{PreferenceID: "pref-2", Language: &lang},
		}

		result, err := svc.CreateBatch(context.Background(), entities)

		if err != nil {
			t.Errorf("CreateBatch() error = %v; want nil", err)
		}
		if len(result) != 2 {
			t.Errorf("len(result) = %d; want 2", len(result))
		}
	})

	t.Run("Update modifies preference", func(t *testing.T) {
		repo := newUserPreferenceRepoMock(nil)
		svc := NewUserPreferenceService(repo)
		theme1, theme2 := "dark", "light"
		existing := &domain.UserPreference{PreferenceID: "pref-1", Theme: &theme1}
		svc.Create(context.Background(), existing)

		updated := &domain.UserPreference{PreferenceID: "pref-1", Theme: &theme2}
		result, err := svc.Update(context.Background(), updated)

		if err != nil {
			t.Errorf("Update() error = %v; want nil", err)
		}
		if *result.Theme != "light" {
			t.Errorf("Theme = %q; want light", *result.Theme)
		}
	})

	t.Run("Delete removes preference", func(t *testing.T) {
		theme := "dark"
		repo := newUserPreferenceRepoMock([]domain.UserPreference{
			{PreferenceID: "pref-1", Theme: &theme},
		})
		svc := NewUserPreferenceService(repo)

		ok, err := svc.Delete(context.Background(), "pref-1")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if !ok {
			t.Error("Delete() = false; want true")
		}
	})

	t.Run("Delete returns false for nonexistent", func(t *testing.T) {
		repo := newUserPreferenceRepoMock(nil)
		svc := NewUserPreferenceService(repo)

		ok, err := svc.Delete(context.Background(), "nonexistent")

		if err != nil {
			t.Errorf("Delete() error = %v; want nil", err)
		}
		if ok {
			t.Error("Delete() = true; want false")
		}
	})
}
