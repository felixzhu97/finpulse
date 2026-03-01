package persistence

import (
	"context"
	"errors"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TradeRepo struct {
	pool *pgxpool.Pool
}

func NewTradeRepo(pool *pgxpool.Pool) *TradeRepo {
	return &TradeRepo{pool: pool}
}

func (r *TradeRepo) GetByID(ctx context.Context, tradeID string) (*domain.Trade, error) {
	var t domain.Trade
	err := r.pool.QueryRow(ctx,
		`SELECT trade_id::text, order_id::text, quantity, price, fee, executed_at FROM trade WHERE trade_id = $1::uuid`,
		tradeID,
	).Scan(&t.TradeID, &t.OrderID, &t.Quantity, &t.Price, &t.Fee, &t.ExecutedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, application.ErrNotFound
		}
		return nil, err
	}
	return &t, nil
}

func (r *TradeRepo) List(ctx context.Context, limit, offset int) ([]domain.Trade, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT trade_id::text, order_id::text, quantity, price, fee, executed_at FROM trade ORDER BY executed_at LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Trade
	for rows.Next() {
		var t domain.Trade
		if err := rows.Scan(&t.TradeID, &t.OrderID, &t.Quantity, &t.Price, &t.Fee, &t.ExecutedAt); err != nil {
			return nil, err
		}
		list = append(list, t)
	}
	return list, rows.Err()
}

func (r *TradeRepo) Add(ctx context.Context, t *domain.Trade) (*domain.Trade, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO trade (trade_id, order_id, quantity, price, fee) VALUES ($1::uuid, $2::uuid, $3, $4, $5)
		 RETURNING trade_id::text, order_id::text, quantity, price, fee, executed_at`,
		t.TradeID, t.OrderID, t.Quantity, t.Price, t.Fee,
	).Scan(&t.TradeID, &t.OrderID, &t.Quantity, &t.Price, &t.Fee, &t.ExecutedAt)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (r *TradeRepo) AddMany(ctx context.Context, entities []domain.Trade) ([]domain.Trade, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		fee := e.Fee
		if fee == nil {
			zero := 0.0
			fee = &zero
		}
		batch.Queue(`INSERT INTO trade (trade_id, order_id, quantity, price, fee) VALUES ($1::uuid, $2::uuid, $3, $4, $5)`,
			e.TradeID, e.OrderID, e.Quantity, e.Price, fee)
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

func (r *TradeRepo) Save(ctx context.Context, t *domain.Trade) (*domain.Trade, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE trade SET order_id=$2::uuid, quantity=$3, price=$4, fee=$5 WHERE trade_id=$1::uuid`,
		t.TradeID, t.OrderID, t.Quantity, t.Price, t.Fee)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, application.ErrNotFound
	}
	return r.GetByID(ctx, t.TradeID)
}

func (r *TradeRepo) Remove(ctx context.Context, tradeID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM trade WHERE trade_id=$1::uuid`, tradeID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
