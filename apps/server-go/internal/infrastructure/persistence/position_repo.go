package persistence

import (
	"context"
	"errors"
	"time"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PositionRepo struct {
	pool *pgxpool.Pool
}

func NewPositionRepo(pool *pgxpool.Pool) *PositionRepo {
	return &PositionRepo{pool: pool}
}

func (r *PositionRepo) GetByID(ctx context.Context, positionID string) (*domain.Position, error) {
	var p domain.Position
	err := r.pool.QueryRow(ctx,
		`SELECT position_id::text, portfolio_id::text, instrument_id::text, quantity, cost_basis, as_of_date::text FROM position WHERE position_id = $1::uuid`,
		positionID,
	).Scan(&p.PositionID, &p.PortfolioID, &p.InstrumentID, &p.Quantity, &p.CostBasis, &p.AsOfDate)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, application.ErrNotFound
		}
		return nil, err
	}
	return &p, nil
}

func (r *PositionRepo) List(ctx context.Context, limit, offset int) ([]domain.Position, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT position_id::text, portfolio_id::text, instrument_id::text, quantity, cost_basis, as_of_date::text FROM position ORDER BY as_of_date LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Position
	for rows.Next() {
		var p domain.Position
		if err := rows.Scan(&p.PositionID, &p.PortfolioID, &p.InstrumentID, &p.Quantity, &p.CostBasis, &p.AsOfDate); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, rows.Err()
}

func (r *PositionRepo) Add(ctx context.Context, p *domain.Position) (*domain.Position, error) {
	if p.AsOfDate == "" {
		p.AsOfDate = time.Now().Format("2006-01-02")
	}
	err := r.pool.QueryRow(ctx,
		`INSERT INTO position (position_id, portfolio_id, instrument_id, quantity, cost_basis, as_of_date) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6::date)
		 RETURNING position_id::text, portfolio_id::text, instrument_id::text, quantity, cost_basis, as_of_date::text`,
		p.PositionID, p.PortfolioID, p.InstrumentID, p.Quantity, p.CostBasis, p.AsOfDate,
	).Scan(&p.PositionID, &p.PortfolioID, &p.InstrumentID, &p.Quantity, &p.CostBasis, &p.AsOfDate)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *PositionRepo) AddMany(ctx context.Context, entities []domain.Position) ([]domain.Position, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	now := time.Now().Format("2006-01-02")
	batch := &pgx.Batch{}
	for i := range entities {
		e := &entities[i]
		if e.AsOfDate == "" {
			e.AsOfDate = now
		}
		batch.Queue(`INSERT INTO position (position_id, portfolio_id, instrument_id, quantity, cost_basis, as_of_date) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6::date)`,
			e.PositionID, e.PortfolioID, e.InstrumentID, e.Quantity, e.CostBasis, e.AsOfDate)
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

func (r *PositionRepo) Save(ctx context.Context, p *domain.Position) (*domain.Position, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE position SET portfolio_id=$2::uuid, instrument_id=$3::uuid, quantity=$4, cost_basis=$5, as_of_date=$6::date WHERE position_id=$1::uuid`,
		p.PositionID, p.PortfolioID, p.InstrumentID, p.Quantity, p.CostBasis, p.AsOfDate)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, application.ErrNotFound
	}
	return r.GetByID(ctx, p.PositionID)
}

func (r *PositionRepo) Remove(ctx context.Context, positionID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM position WHERE position_id=$1::uuid`, positionID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
