package persistence

import (
	"context"

	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PaymentRepo struct {
	pool *pgxpool.Pool
}

func NewPaymentRepo(pool *pgxpool.Pool) *PaymentRepo {
	return &PaymentRepo{pool: pool}
}

func (r *PaymentRepo) GetByID(ctx context.Context, paymentID string) (*domain.Payment, error) {
	var p domain.Payment
	err := r.pool.QueryRow(ctx,
		`SELECT payment_id::text, account_id::text, counterparty, amount, currency, status, created_at FROM payment WHERE payment_id = $1::uuid`,
		paymentID,
	).Scan(&p.PaymentID, &p.AccountID, &p.Counterparty, &p.Amount, &p.Currency, &p.Status, &p.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PaymentRepo) List(ctx context.Context, limit, offset int) ([]domain.Payment, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT payment_id::text, account_id::text, counterparty, amount, currency, status, created_at FROM payment ORDER BY created_at LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Payment
	for rows.Next() {
		var p domain.Payment
		if err := rows.Scan(&p.PaymentID, &p.AccountID, &p.Counterparty, &p.Amount, &p.Currency, &p.Status, &p.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, rows.Err()
}

func (r *PaymentRepo) Add(ctx context.Context, p *domain.Payment) (*domain.Payment, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO payment (payment_id, account_id, counterparty, amount, currency, status) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6)
		 RETURNING payment_id::text, account_id::text, counterparty, amount, currency, status, created_at`,
		p.PaymentID, p.AccountID, p.Counterparty, p.Amount, p.Currency, p.Status,
	).Scan(&p.PaymentID, &p.AccountID, &p.Counterparty, &p.Amount, &p.Currency, &p.Status, &p.CreatedAt)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *PaymentRepo) AddMany(ctx context.Context, entities []domain.Payment) ([]domain.Payment, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO payment (payment_id, account_id, counterparty, amount, currency, status) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6)`,
			e.PaymentID, e.AccountID, e.Counterparty, e.Amount, e.Currency, e.Status)
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

func (r *PaymentRepo) Save(ctx context.Context, p *domain.Payment) (*domain.Payment, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE payment SET account_id=$2::uuid, counterparty=$3, amount=$4, currency=$5, status=$6 WHERE payment_id=$1::uuid`,
		p.PaymentID, p.AccountID, p.Counterparty, p.Amount, p.Currency, p.Status)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, pgx.ErrNoRows
	}
	return r.GetByID(ctx, p.PaymentID)
}

func (r *PaymentRepo) Remove(ctx context.Context, paymentID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM payment WHERE payment_id=$1::uuid`, paymentID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
