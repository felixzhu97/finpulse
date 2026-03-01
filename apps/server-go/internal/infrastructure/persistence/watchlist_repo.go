package persistence

import (
	"context"

	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WatchlistRepo struct {
	pool *pgxpool.Pool
}

func NewWatchlistRepo(pool *pgxpool.Pool) *WatchlistRepo {
	return &WatchlistRepo{pool: pool}
}

func (r *WatchlistRepo) GetByID(ctx context.Context, watchlistID string) (*domain.Watchlist, error) {
	var w domain.Watchlist
	err := r.pool.QueryRow(ctx,
		`SELECT watchlist_id::text, customer_id::text, name, created_at FROM watchlist WHERE watchlist_id = $1::uuid`,
		watchlistID,
	).Scan(&w.WatchlistID, &w.CustomerID, &w.Name, &w.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &w, nil
}

func (r *WatchlistRepo) List(ctx context.Context, limit, offset int) ([]domain.Watchlist, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT watchlist_id::text, customer_id::text, name, created_at FROM watchlist ORDER BY created_at LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Watchlist
	for rows.Next() {
		var w domain.Watchlist
		if err := rows.Scan(&w.WatchlistID, &w.CustomerID, &w.Name, &w.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, w)
	}
	return list, rows.Err()
}

func (r *WatchlistRepo) Add(ctx context.Context, w *domain.Watchlist) (*domain.Watchlist, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO watchlist (watchlist_id, customer_id, name) VALUES ($1::uuid, $2::uuid, $3)
		 RETURNING watchlist_id::text, customer_id::text, name, created_at`,
		w.WatchlistID, w.CustomerID, w.Name,
	).Scan(&w.WatchlistID, &w.CustomerID, &w.Name, &w.CreatedAt)
	if err != nil {
		return nil, err
	}
	return w, nil
}

func (r *WatchlistRepo) AddMany(ctx context.Context, entities []domain.Watchlist) ([]domain.Watchlist, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO watchlist (watchlist_id, customer_id, name) VALUES ($1::uuid, $2::uuid, $3)`,
			e.WatchlistID, e.CustomerID, e.Name)
	}
	br := r.pool.SendBatch(ctx, batch)
	defer br.Close()
	for range entities {
		if _, err := br.Exec(); err != nil {
			return nil, err
		}
	}
	return entities, nil
}

func (r *WatchlistRepo) Save(ctx context.Context, w *domain.Watchlist) (*domain.Watchlist, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE watchlist SET customer_id=$2::uuid, name=$3 WHERE watchlist_id=$1::uuid`,
		w.WatchlistID, w.CustomerID, w.Name)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, pgx.ErrNoRows
	}
	return r.GetByID(ctx, w.WatchlistID)
}

func (r *WatchlistRepo) Remove(ctx context.Context, watchlistID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM watchlist WHERE watchlist_id=$1::uuid`, watchlistID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
