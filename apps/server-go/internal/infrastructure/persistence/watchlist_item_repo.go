package persistence

import (
	"context"

	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WatchlistItemRepo struct {
	pool *pgxpool.Pool
}

func NewWatchlistItemRepo(pool *pgxpool.Pool) *WatchlistItemRepo {
	return &WatchlistItemRepo{pool: pool}
}

func (r *WatchlistItemRepo) GetByID(ctx context.Context, watchlistItemID string) (*domain.WatchlistItem, error) {
	var w domain.WatchlistItem
	err := r.pool.QueryRow(ctx,
		`SELECT watchlist_item_id::text, watchlist_id::text, instrument_id::text, added_at FROM watchlist_item WHERE watchlist_item_id = $1::uuid`,
		watchlistItemID,
	).Scan(&w.WatchlistItemID, &w.WatchlistID, &w.InstrumentID, &w.AddedAt)
	if err != nil {
		return nil, err
	}
	return &w, nil
}

func (r *WatchlistItemRepo) List(ctx context.Context, limit, offset int) ([]domain.WatchlistItem, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT watchlist_item_id::text, watchlist_id::text, instrument_id::text, added_at FROM watchlist_item ORDER BY added_at LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.WatchlistItem
	for rows.Next() {
		var w domain.WatchlistItem
		if err := rows.Scan(&w.WatchlistItemID, &w.WatchlistID, &w.InstrumentID, &w.AddedAt); err != nil {
			return nil, err
		}
		list = append(list, w)
	}
	return list, rows.Err()
}

func (r *WatchlistItemRepo) Add(ctx context.Context, w *domain.WatchlistItem) (*domain.WatchlistItem, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO watchlist_item (watchlist_item_id, watchlist_id, instrument_id) VALUES ($1::uuid, $2::uuid, $3::uuid)
		 RETURNING watchlist_item_id::text, watchlist_id::text, instrument_id::text, added_at`,
		w.WatchlistItemID, w.WatchlistID, w.InstrumentID,
	).Scan(&w.WatchlistItemID, &w.WatchlistID, &w.InstrumentID, &w.AddedAt)
	if err != nil {
		return nil, err
	}
	return w, nil
}

func (r *WatchlistItemRepo) AddMany(ctx context.Context, entities []domain.WatchlistItem) ([]domain.WatchlistItem, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO watchlist_item (watchlist_item_id, watchlist_id, instrument_id) VALUES ($1::uuid, $2::uuid, $3::uuid)`,
			e.WatchlistItemID, e.WatchlistID, e.InstrumentID)
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

func (r *WatchlistItemRepo) Save(ctx context.Context, w *domain.WatchlistItem) (*domain.WatchlistItem, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE watchlist_item SET watchlist_id=$2::uuid, instrument_id=$3::uuid WHERE watchlist_item_id=$1::uuid`,
		w.WatchlistItemID, w.WatchlistID, w.InstrumentID)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, pgx.ErrNoRows
	}
	return r.GetByID(ctx, w.WatchlistItemID)
}

func (r *WatchlistItemRepo) Remove(ctx context.Context, watchlistItemID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM watchlist_item WHERE watchlist_item_id=$1::uuid`, watchlistItemID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
