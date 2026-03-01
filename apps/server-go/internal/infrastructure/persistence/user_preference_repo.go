package persistence

import (
	"context"
	"time"

	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserPreferenceRepo struct {
	pool *pgxpool.Pool
}

func NewUserPreferenceRepo(pool *pgxpool.Pool) *UserPreferenceRepo {
	return &UserPreferenceRepo{pool: pool}
}

func (r *UserPreferenceRepo) GetByID(ctx context.Context, preferenceID string) (*domain.UserPreference, error) {
	var u domain.UserPreference
	err := r.pool.QueryRow(ctx,
		`SELECT preference_id::text, customer_id::text, theme, language, notifications_enabled, updated_at FROM user_preference WHERE preference_id = $1::uuid`,
		preferenceID,
	).Scan(&u.PreferenceID, &u.CustomerID, &u.Theme, &u.Language, &u.NotificationsEnabled, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserPreferenceRepo) List(ctx context.Context, limit, offset int) ([]domain.UserPreference, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT preference_id::text, customer_id::text, theme, language, notifications_enabled, updated_at FROM user_preference ORDER BY updated_at LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.UserPreference
	for rows.Next() {
		var u domain.UserPreference
		if err := rows.Scan(&u.PreferenceID, &u.CustomerID, &u.Theme, &u.Language, &u.NotificationsEnabled, &u.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, u)
	}
	return list, rows.Err()
}

func (r *UserPreferenceRepo) Add(ctx context.Context, u *domain.UserPreference) (*domain.UserPreference, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO user_preference (preference_id, customer_id, theme, language, notifications_enabled) VALUES ($1::uuid, $2::uuid, $3, $4, $5)
		 RETURNING preference_id::text, customer_id::text, theme, language, notifications_enabled, updated_at`,
		u.PreferenceID, u.CustomerID, u.Theme, u.Language, u.NotificationsEnabled,
	).Scan(&u.PreferenceID, &u.CustomerID, &u.Theme, &u.Language, &u.NotificationsEnabled, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *UserPreferenceRepo) AddMany(ctx context.Context, entities []domain.UserPreference) ([]domain.UserPreference, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO user_preference (preference_id, customer_id, theme, language, notifications_enabled) VALUES ($1::uuid, $2::uuid, $3, $4, $5)`,
			e.PreferenceID, e.CustomerID, e.Theme, e.Language, e.NotificationsEnabled)
	}
	br := r.pool.SendBatch(ctx, batch)
	defer br.Close()
	now := time.Now().UTC()
	for range entities {
		if _, err := br.Exec(); err != nil {
			return nil, err
		}
	}
	for i := range entities {
		entities[i].UpdatedAt = now
	}
	return entities, nil
}

func (r *UserPreferenceRepo) Save(ctx context.Context, u *domain.UserPreference) (*domain.UserPreference, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE user_preference SET customer_id=$2::uuid, theme=$3, language=$4, notifications_enabled=$5 WHERE preference_id=$1::uuid`,
		u.PreferenceID, u.CustomerID, u.Theme, u.Language, u.NotificationsEnabled)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, pgx.ErrNoRows
	}
	return r.GetByID(ctx, u.PreferenceID)
}

func (r *UserPreferenceRepo) Remove(ctx context.Context, preferenceID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM user_preference WHERE preference_id=$1::uuid`, preferenceID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
