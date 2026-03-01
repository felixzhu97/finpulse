package persistence

import (
	"context"

	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MarketDataRepo struct {
	pool *pgxpool.Pool
}

func NewMarketDataRepo(pool *pgxpool.Pool) *MarketDataRepo {
	return &MarketDataRepo{pool: pool}
}

func (r *MarketDataRepo) GetByID(ctx context.Context, dataID string) (*domain.MarketData, error) {
	var m domain.MarketData
	err := r.pool.QueryRow(ctx,
		`SELECT data_id::text, instrument_id::text, timestamp, open, high, low, close, volume, change_pct FROM market_data WHERE data_id = $1::uuid`,
		dataID,
	).Scan(&m.DataID, &m.InstrumentID, &m.Timestamp, &m.Open, &m.High, &m.Low, &m.Close, &m.Volume, &m.ChangePct)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *MarketDataRepo) List(ctx context.Context, limit, offset int) ([]domain.MarketData, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT data_id::text, instrument_id::text, timestamp, open, high, low, close, volume, change_pct FROM market_data ORDER BY timestamp LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.MarketData
	for rows.Next() {
		var m domain.MarketData
		if err := rows.Scan(&m.DataID, &m.InstrumentID, &m.Timestamp, &m.Open, &m.High, &m.Low, &m.Close, &m.Volume, &m.ChangePct); err != nil {
			return nil, err
		}
		list = append(list, m)
	}
	return list, rows.Err()
}

func (r *MarketDataRepo) Add(ctx context.Context, m *domain.MarketData) (*domain.MarketData, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO market_data (data_id, instrument_id, timestamp, open, high, low, close, volume, change_pct) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING data_id::text, instrument_id::text, timestamp, open, high, low, close, volume, change_pct`,
		m.DataID, m.InstrumentID, m.Timestamp, m.Open, m.High, m.Low, m.Close, m.Volume, m.ChangePct,
	).Scan(&m.DataID, &m.InstrumentID, &m.Timestamp, &m.Open, &m.High, &m.Low, &m.Close, &m.Volume, &m.ChangePct)
	if err != nil {
		return nil, err
	}
	return m, nil
}

func (r *MarketDataRepo) AddMany(ctx context.Context, entities []domain.MarketData) ([]domain.MarketData, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO market_data (data_id, instrument_id, timestamp, open, high, low, close, volume, change_pct) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9)`,
			e.DataID, e.InstrumentID, e.Timestamp, e.Open, e.High, e.Low, e.Close, e.Volume, e.ChangePct)
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

func (r *MarketDataRepo) Save(ctx context.Context, m *domain.MarketData) (*domain.MarketData, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE market_data SET instrument_id=$2::uuid, timestamp=$3, open=$4, high=$5, low=$6, close=$7, volume=$8, change_pct=$9 WHERE data_id=$1::uuid`,
		m.DataID, m.InstrumentID, m.Timestamp, m.Open, m.High, m.Low, m.Close, m.Volume, m.ChangePct)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, pgx.ErrNoRows
	}
	return r.GetByID(ctx, m.DataID)
}

func (r *MarketDataRepo) Remove(ctx context.Context, dataID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM market_data WHERE data_id=$1::uuid`, dataID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
