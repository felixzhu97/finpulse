package persistence

import (
	"context"
	"errors"

	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WalletBalanceRepo struct {
	pool *pgxpool.Pool
}

func NewWalletBalanceRepo(pool *pgxpool.Pool) *WalletBalanceRepo {
	return &WalletBalanceRepo{pool: pool}
}

func (r *WalletBalanceRepo) GetBalance(ctx context.Context, accountID, currency string) (float64, error) {
	var balance float64
	err := r.pool.QueryRow(ctx,
		`SELECT balance FROM wallet_balance WHERE account_id = $1::uuid AND currency = $2`,
		accountID, currency,
	).Scan(&balance)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, nil
		}
		return 0, err
	}
	return balance, nil
}

func (r *WalletBalanceRepo) GetBalanceForUpdate(ctx context.Context, tx pgx.Tx, accountID, currency string) (*domain.WalletBalance, error) {
	var w domain.WalletBalance
	err := tx.QueryRow(ctx,
		`SELECT account_id::text, currency, balance, updated_at FROM wallet_balance WHERE account_id = $1::uuid AND currency = $2 FOR UPDATE`,
		accountID, currency,
	).Scan(&w.AccountID, &w.Currency, &w.Balance, &w.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &w, nil
}

func (r *WalletBalanceRepo) UpdateBalance(ctx context.Context, tx pgx.Tx, accountID, currency string, delta float64) (*domain.WalletBalance, error) {
	_, err := tx.Exec(ctx,
		`INSERT INTO wallet_balance (account_id, currency, balance, updated_at)
		 VALUES ($1::uuid, $2, $3, now())
		 ON CONFLICT (account_id, currency) DO UPDATE SET
		   balance = wallet_balance.balance + $3,
		   updated_at = now()`,
		accountID, currency, delta)
	if err != nil {
		return nil, err
	}
	var w domain.WalletBalance
	err = tx.QueryRow(ctx,
		`SELECT account_id::text, currency, balance, updated_at FROM wallet_balance WHERE account_id = $1::uuid AND currency = $2`,
		accountID, currency,
	).Scan(&w.AccountID, &w.Currency, &w.Balance, &w.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &w, nil
}
