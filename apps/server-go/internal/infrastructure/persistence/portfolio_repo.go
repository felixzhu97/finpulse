package persistence

import (
	"context"

	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PortfolioRepo struct {
	pool *pgxpool.Pool
}

func NewPortfolioRepo(pool *pgxpool.Pool) *PortfolioRepo {
	return &PortfolioRepo{pool: pool}
}

func (r *PortfolioRepo) GetByID(ctx context.Context, portfolioID string) (*domain.PortfolioSchema, error) {
	var p domain.PortfolioSchema
	err := r.pool.QueryRow(ctx,
		`SELECT portfolio_id::text, account_id::text, name, base_currency, created_at FROM portfolio WHERE portfolio_id = $1::uuid`,
		portfolioID,
	).Scan(&p.PortfolioID, &p.AccountID, &p.Name, &p.BaseCurrency, &p.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PortfolioRepo) List(ctx context.Context, limit, offset int) ([]domain.PortfolioSchema, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT portfolio_id::text, account_id::text, name, base_currency, created_at FROM portfolio ORDER BY created_at LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.PortfolioSchema
	for rows.Next() {
		var p domain.PortfolioSchema
		if err := rows.Scan(&p.PortfolioID, &p.AccountID, &p.Name, &p.BaseCurrency, &p.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, rows.Err()
}

func (r *PortfolioRepo) Add(ctx context.Context, p *domain.PortfolioSchema) (*domain.PortfolioSchema, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO portfolio (portfolio_id, account_id, name, base_currency) VALUES ($1::uuid, $2::uuid, $3, $4)
		 RETURNING portfolio_id::text, account_id::text, name, base_currency, created_at`,
		p.PortfolioID, p.AccountID, p.Name, p.BaseCurrency,
	).Scan(&p.PortfolioID, &p.AccountID, &p.Name, &p.BaseCurrency, &p.CreatedAt)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *PortfolioRepo) AddMany(ctx context.Context, entities []domain.PortfolioSchema) ([]domain.PortfolioSchema, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO portfolio (portfolio_id, account_id, name, base_currency) VALUES ($1::uuid, $2::uuid, $3, $4)`,
			e.PortfolioID, e.AccountID, e.Name, e.BaseCurrency)
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

func (r *PortfolioRepo) Save(ctx context.Context, p *domain.PortfolioSchema) (*domain.PortfolioSchema, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE portfolio SET account_id=$2::uuid, name=$3, base_currency=$4 WHERE portfolio_id=$1::uuid`,
		p.PortfolioID, p.AccountID, p.Name, p.BaseCurrency)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, pgx.ErrNoRows
	}
	return r.GetByID(ctx, p.PortfolioID)
}

func (r *PortfolioRepo) Remove(ctx context.Context, portfolioID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM portfolio WHERE portfolio_id=$1::uuid`, portfolioID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
