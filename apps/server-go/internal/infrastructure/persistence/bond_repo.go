package persistence

import (
	"context"
	"errors"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BondRepo struct {
	pool *pgxpool.Pool
}

func NewBondRepo(pool *pgxpool.Pool) *BondRepo {
	return &BondRepo{pool: pool}
}

func (r *BondRepo) GetByID(ctx context.Context, bondID string) (*domain.Bond, error) {
	var b domain.Bond
	err := r.pool.QueryRow(ctx,
		`SELECT bond_id::text, instrument_id::text, face_value, coupon_rate, ytm, duration, convexity, maturity_years, frequency FROM bond WHERE bond_id = $1::uuid`,
		bondID,
	).Scan(&b.BondID, &b.InstrumentID, &b.FaceValue, &b.CouponRate, &b.YTM, &b.Duration, &b.Convexity, &b.MaturityYears, &b.Frequency)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, application.ErrNotFound
		}
		return nil, err
	}
	return &b, nil
}

func (r *BondRepo) List(ctx context.Context, limit, offset int) ([]domain.Bond, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT bond_id::text, instrument_id::text, face_value, coupon_rate, ytm, duration, convexity, maturity_years, frequency FROM bond ORDER BY bond_id LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Bond
	for rows.Next() {
		var b domain.Bond
		if err := rows.Scan(&b.BondID, &b.InstrumentID, &b.FaceValue, &b.CouponRate, &b.YTM, &b.Duration, &b.Convexity, &b.MaturityYears, &b.Frequency); err != nil {
			return nil, err
		}
		list = append(list, b)
	}
	return list, rows.Err()
}

func (r *BondRepo) Add(ctx context.Context, b *domain.Bond) (*domain.Bond, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO bond (bond_id, instrument_id, face_value, coupon_rate, ytm, duration, convexity, maturity_years, frequency) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING bond_id::text, instrument_id::text, face_value, coupon_rate, ytm, duration, convexity, maturity_years, frequency`,
		b.BondID, b.InstrumentID, b.FaceValue, b.CouponRate, b.YTM, b.Duration, b.Convexity, b.MaturityYears, b.Frequency,
	).Scan(&b.BondID, &b.InstrumentID, &b.FaceValue, &b.CouponRate, &b.YTM, &b.Duration, &b.Convexity, &b.MaturityYears, &b.Frequency)
	if err != nil {
		return nil, err
	}
	return b, nil
}

func (r *BondRepo) AddMany(ctx context.Context, entities []domain.Bond) ([]domain.Bond, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO bond (bond_id, instrument_id, face_value, coupon_rate, ytm, duration, convexity, maturity_years, frequency) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9)`,
			e.BondID, e.InstrumentID, e.FaceValue, e.CouponRate, e.YTM, e.Duration, e.Convexity, e.MaturityYears, e.Frequency)
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

func (r *BondRepo) Save(ctx context.Context, b *domain.Bond) (*domain.Bond, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE bond SET instrument_id=$2::uuid, face_value=$3, coupon_rate=$4, ytm=$5, duration=$6, convexity=$7, maturity_years=$8, frequency=$9 WHERE bond_id=$1::uuid`,
		b.BondID, b.InstrumentID, b.FaceValue, b.CouponRate, b.YTM, b.Duration, b.Convexity, b.MaturityYears, b.Frequency)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, application.ErrNotFound
	}
	return r.GetByID(ctx, b.BondID)
}

func (r *BondRepo) Remove(ctx context.Context, bondID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM bond WHERE bond_id=$1::uuid`, bondID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
