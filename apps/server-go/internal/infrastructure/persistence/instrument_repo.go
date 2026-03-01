package persistence

import (
	"context"
	"errors"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type InstrumentRepo struct {
	pool *pgxpool.Pool
}

func NewInstrumentRepo(pool *pgxpool.Pool) *InstrumentRepo {
	return &InstrumentRepo{pool: pool}
}

func (r *InstrumentRepo) GetByID(ctx context.Context, instrumentID string) (*domain.Instrument, error) {
	var row domain.Instrument
	err := r.pool.QueryRow(ctx,
		`SELECT instrument_id::text, symbol, name, asset_class, currency, exchange FROM instrument WHERE instrument_id = $1::uuid`,
		instrumentID,
	).Scan(&row.InstrumentID, &row.Symbol, &row.Name, &row.AssetClass, &row.Currency, &row.Exchange)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, application.ErrNotFound
		}
		return nil, err
	}
	return &row, nil
}

func (r *InstrumentRepo) List(ctx context.Context, limit, offset int) ([]domain.Instrument, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT instrument_id::text, symbol, name, asset_class, currency, exchange FROM instrument ORDER BY symbol LIMIT $1 OFFSET $2`,
		limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []domain.Instrument
	for rows.Next() {
		var row domain.Instrument
		if err := rows.Scan(&row.InstrumentID, &row.Symbol, &row.Name, &row.AssetClass, &row.Currency, &row.Exchange); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func (r *InstrumentRepo) Add(ctx context.Context, i *domain.Instrument) (*domain.Instrument, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO instrument (instrument_id, symbol, name, asset_class, currency, exchange) VALUES ($1::uuid, $2, $3, $4, $5, $6)
		 RETURNING instrument_id::text, symbol, name, asset_class, currency, exchange`,
		i.InstrumentID, i.Symbol, i.Name, i.AssetClass, i.Currency, i.Exchange,
	).Scan(&i.InstrumentID, &i.Symbol, &i.Name, &i.AssetClass, &i.Currency, &i.Exchange)
	if err != nil {
		return nil, err
	}
	return i, nil
}

func (r *InstrumentRepo) AddMany(ctx context.Context, entities []domain.Instrument) ([]domain.Instrument, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO instrument (instrument_id, symbol, name, asset_class, currency, exchange) VALUES ($1::uuid, $2, $3, $4, $5, $6)`,
			e.InstrumentID, e.Symbol, e.Name, e.AssetClass, e.Currency, e.Exchange)
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

func (r *InstrumentRepo) Save(ctx context.Context, i *domain.Instrument) (*domain.Instrument, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE instrument SET symbol=$2, name=$3, asset_class=$4, currency=$5, exchange=$6 WHERE instrument_id=$1::uuid`,
		i.InstrumentID, i.Symbol, i.Name, i.AssetClass, i.Currency, i.Exchange)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, application.ErrNotFound
	}
	return r.GetByID(ctx, i.InstrumentID)
}

func (r *InstrumentRepo) Remove(ctx context.Context, instrumentID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM instrument WHERE instrument_id=$1::uuid`, instrumentID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
