package persistence

import (
	"context"

	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type InstrumentRepo struct {
	pool *pgxpool.Pool
}

func NewInstrumentRepo(pool *pgxpool.Pool) *InstrumentRepo {
	return &InstrumentRepo{pool: pool}
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
