package persistence

import (
	"context"
	"errors"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CashTransactionRepo struct {
	pool *pgxpool.Pool
}

func NewCashTransactionRepo(pool *pgxpool.Pool) *CashTransactionRepo {
	return &CashTransactionRepo{pool: pool}
}

func (r *CashTransactionRepo) GetByID(ctx context.Context, transactionID string) (*domain.CashTransaction, error) {
	var c domain.CashTransaction
	err := r.pool.QueryRow(ctx,
		`SELECT transaction_id::text, account_id::text, type, amount, currency, status, created_at FROM cash_transaction WHERE transaction_id = $1::uuid`,
		transactionID,
	).Scan(&c.TransactionID, &c.AccountID, &c.Type, &c.Amount, &c.Currency, &c.Status, &c.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, application.ErrNotFound
		}
		return nil, err
	}
	return &c, nil
}

func (r *CashTransactionRepo) List(ctx context.Context, limit, offset int) ([]domain.CashTransaction, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT transaction_id::text, account_id::text, type, amount, currency, status, created_at FROM cash_transaction ORDER BY created_at LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.CashTransaction
	for rows.Next() {
		var c domain.CashTransaction
		if err := rows.Scan(&c.TransactionID, &c.AccountID, &c.Type, &c.Amount, &c.Currency, &c.Status, &c.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

func (r *CashTransactionRepo) Add(ctx context.Context, c *domain.CashTransaction) (*domain.CashTransaction, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO cash_transaction (transaction_id, account_id, type, amount, currency, status) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6)
		 RETURNING transaction_id::text, account_id::text, type, amount, currency, status, created_at`,
		c.TransactionID, c.AccountID, c.Type, c.Amount, c.Currency, c.Status,
	).Scan(&c.TransactionID, &c.AccountID, &c.Type, &c.Amount, &c.Currency, &c.Status, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (r *CashTransactionRepo) AddMany(ctx context.Context, entities []domain.CashTransaction) ([]domain.CashTransaction, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO cash_transaction (transaction_id, account_id, type, amount, currency, status) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6)`,
			e.TransactionID, e.AccountID, e.Type, e.Amount, e.Currency, e.Status)
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

func (r *CashTransactionRepo) Save(ctx context.Context, c *domain.CashTransaction) (*domain.CashTransaction, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE cash_transaction SET account_id=$2::uuid, type=$3, amount=$4, currency=$5, status=$6 WHERE transaction_id=$1::uuid`,
		c.TransactionID, c.AccountID, c.Type, c.Amount, c.Currency, c.Status)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, application.ErrNotFound
	}
	return r.GetByID(ctx, c.TransactionID)
}

func (r *CashTransactionRepo) Remove(ctx context.Context, transactionID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM cash_transaction WHERE transaction_id=$1::uuid`, transactionID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
