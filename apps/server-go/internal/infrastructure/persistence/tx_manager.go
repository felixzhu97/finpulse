package persistence

import (
	"context"

	"finpulse/server-go/internal/application"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PgxTxManager struct {
	pool *pgxpool.Pool
}

func NewPgxTxManager(pool *pgxpool.Pool) *PgxTxManager {
	return &PgxTxManager{pool: pool}
}

func (m *PgxTxManager) WithTx(ctx context.Context, fn func(tx application.Tx) error) error {
	tx, err := m.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	if err := fn(tx); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
