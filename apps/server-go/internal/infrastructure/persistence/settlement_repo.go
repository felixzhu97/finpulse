package persistence

import (
	"context"

	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SettlementRepo struct {
	pool *pgxpool.Pool
}

func NewSettlementRepo(pool *pgxpool.Pool) *SettlementRepo {
	return &SettlementRepo{pool: pool}
}

func (r *SettlementRepo) GetByID(ctx context.Context, settlementID string) (*domain.Settlement, error) {
	var s domain.Settlement
	err := r.pool.QueryRow(ctx,
		`SELECT settlement_id::text, trade_id::text, payment_id::text, status, settled_at FROM settlement WHERE settlement_id = $1::uuid`,
		settlementID,
	).Scan(&s.SettlementID, &s.TradeID, &s.PaymentID, &s.Status, &s.SettledAt)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SettlementRepo) List(ctx context.Context, limit, offset int) ([]domain.Settlement, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT settlement_id::text, trade_id::text, payment_id::text, status, settled_at FROM settlement ORDER BY settlement_id LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Settlement
	for rows.Next() {
		var s domain.Settlement
		if err := rows.Scan(&s.SettlementID, &s.TradeID, &s.PaymentID, &s.Status, &s.SettledAt); err != nil {
			return nil, err
		}
		list = append(list, s)
	}
	return list, rows.Err()
}

func (r *SettlementRepo) Add(ctx context.Context, s *domain.Settlement) (*domain.Settlement, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO settlement (settlement_id, trade_id, payment_id, status, settled_at) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5)
		 RETURNING settlement_id::text, trade_id::text, payment_id::text, status, settled_at`,
		s.SettlementID, s.TradeID, s.PaymentID, s.Status, s.SettledAt,
	).Scan(&s.SettlementID, &s.TradeID, &s.PaymentID, &s.Status, &s.SettledAt)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (r *SettlementRepo) AddMany(ctx context.Context, entities []domain.Settlement) ([]domain.Settlement, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO settlement (settlement_id, trade_id, payment_id, status, settled_at) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5)`,
			e.SettlementID, e.TradeID, e.PaymentID, e.Status, e.SettledAt)
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

func (r *SettlementRepo) Save(ctx context.Context, s *domain.Settlement) (*domain.Settlement, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE settlement SET trade_id=$2::uuid, payment_id=$3::uuid, status=$4, settled_at=$5 WHERE settlement_id=$1::uuid`,
		s.SettlementID, s.TradeID, s.PaymentID, s.Status, s.SettledAt)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, pgx.ErrNoRows
	}
	return r.GetByID(ctx, s.SettlementID)
}

func (r *SettlementRepo) Remove(ctx context.Context, settlementID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM settlement WHERE settlement_id=$1::uuid`, settlementID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
