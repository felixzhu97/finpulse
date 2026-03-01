package persistence

import (
	"context"

	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OrderRepo struct {
	pool *pgxpool.Pool
}

func NewOrderRepo(pool *pgxpool.Pool) *OrderRepo {
	return &OrderRepo{pool: pool}
}

func (r *OrderRepo) GetByID(ctx context.Context, orderID string) (*domain.Order, error) {
	var o domain.Order
	err := r.pool.QueryRow(ctx,
		`SELECT order_id::text, account_id::text, instrument_id::text, side, quantity, order_type, status, created_at FROM orders WHERE order_id = $1::uuid`,
		orderID,
	).Scan(&o.OrderID, &o.AccountID, &o.InstrumentID, &o.Side, &o.Quantity, &o.OrderType, &o.Status, &o.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &o, nil
}

func (r *OrderRepo) List(ctx context.Context, limit, offset int) ([]domain.Order, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT order_id::text, account_id::text, instrument_id::text, side, quantity, order_type, status, created_at FROM orders ORDER BY created_at LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Order
	for rows.Next() {
		var o domain.Order
		if err := rows.Scan(&o.OrderID, &o.AccountID, &o.InstrumentID, &o.Side, &o.Quantity, &o.OrderType, &o.Status, &o.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, o)
	}
	return list, rows.Err()
}

func (r *OrderRepo) Add(ctx context.Context, o *domain.Order) (*domain.Order, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO orders (order_id, account_id, instrument_id, side, quantity, order_type, status) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7)
		 RETURNING order_id::text, account_id::text, instrument_id::text, side, quantity, order_type, status, created_at`,
		o.OrderID, o.AccountID, o.InstrumentID, o.Side, o.Quantity, o.OrderType, o.Status,
	).Scan(&o.OrderID, &o.AccountID, &o.InstrumentID, &o.Side, &o.Quantity, &o.OrderType, &o.Status, &o.CreatedAt)
	if err != nil {
		return nil, err
	}
	return o, nil
}

func (r *OrderRepo) AddMany(ctx context.Context, entities []domain.Order) ([]domain.Order, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO orders (order_id, account_id, instrument_id, side, quantity, order_type, status) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7)`,
			e.OrderID, e.AccountID, e.InstrumentID, e.Side, e.Quantity, e.OrderType, e.Status)
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

func (r *OrderRepo) Save(ctx context.Context, o *domain.Order) (*domain.Order, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE orders SET account_id=$2::uuid, instrument_id=$3::uuid, side=$4, quantity=$5, order_type=$6, status=$7 WHERE order_id=$1::uuid`,
		o.OrderID, o.AccountID, o.InstrumentID, o.Side, o.Quantity, o.OrderType, o.Status)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, pgx.ErrNoRows
	}
	return r.GetByID(ctx, o.OrderID)
}

func (r *OrderRepo) Remove(ctx context.Context, orderID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM orders WHERE order_id=$1::uuid`, orderID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
