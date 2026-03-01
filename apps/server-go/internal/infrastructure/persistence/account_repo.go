package persistence

import (
	"context"
	"errors"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AccountRepo struct {
	pool *pgxpool.Pool
}

func NewAccountRepo(pool *pgxpool.Pool) *AccountRepo {
	return &AccountRepo{pool: pool}
}

func (r *AccountRepo) GetByID(ctx context.Context, accountID string) (*domain.Account, error) {
	var a domain.Account
	err := r.pool.QueryRow(ctx,
		`SELECT account_id::text, customer_id::text, account_type, currency, status, opened_at FROM account WHERE account_id = $1::uuid`,
		accountID,
	).Scan(&a.AccountID, &a.CustomerID, &a.AccountType, &a.Currency, &a.Status, &a.OpenedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, application.ErrNotFound
		}
		return nil, err
	}
	return &a, nil
}

func (r *AccountRepo) List(ctx context.Context, limit, offset int) ([]domain.Account, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT account_id::text, customer_id::text, account_type, currency, status, opened_at FROM account ORDER BY opened_at LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Account
	for rows.Next() {
		var a domain.Account
		if err := rows.Scan(&a.AccountID, &a.CustomerID, &a.AccountType, &a.Currency, &a.Status, &a.OpenedAt); err != nil {
			return nil, err
		}
		list = append(list, a)
	}
	return list, rows.Err()
}

func (r *AccountRepo) Add(ctx context.Context, a *domain.Account) (*domain.Account, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO account (account_id, customer_id, account_type, currency, status) VALUES ($1::uuid, $2::uuid, $3, $4, $5)
		 RETURNING account_id::text, customer_id::text, account_type, currency, status, opened_at`,
		a.AccountID, a.CustomerID, a.AccountType, a.Currency, a.Status,
	).Scan(&a.AccountID, &a.CustomerID, &a.AccountType, &a.Currency, &a.Status, &a.OpenedAt)
	if err != nil {
		return nil, err
	}
	return a, nil
}

func (r *AccountRepo) AddMany(ctx context.Context, entities []domain.Account) ([]domain.Account, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO account (account_id, customer_id, account_type, currency, status) VALUES ($1::uuid, $2::uuid, $3, $4, $5)`,
			e.AccountID, e.CustomerID, e.AccountType, e.Currency, e.Status)
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

func (r *AccountRepo) Save(ctx context.Context, a *domain.Account) (*domain.Account, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE account SET customer_id=$2::uuid, account_type=$3, currency=$4, status=$5 WHERE account_id=$1::uuid`,
		a.AccountID, a.CustomerID, a.AccountType, a.Currency, a.Status)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, application.ErrNotFound
	}
	return r.GetByID(ctx, a.AccountID)
}

func (r *AccountRepo) Remove(ctx context.Context, accountID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM account WHERE account_id=$1::uuid`, accountID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
