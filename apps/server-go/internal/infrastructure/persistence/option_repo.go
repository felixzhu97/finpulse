package persistence

import (
	"context"
	"errors"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OptionRepo struct {
	pool *pgxpool.Pool
}

func NewOptionRepo(pool *pgxpool.Pool) *OptionRepo {
	return &OptionRepo{pool: pool}
}

func (r *OptionRepo) GetByID(ctx context.Context, optionID string) (*domain.Option, error) {
	var o domain.Option
	err := r.pool.QueryRow(ctx,
		`SELECT option_id::text, instrument_id::text, underlying_instrument_id::text, strike, expiry, option_type, risk_free_rate, volatility, bs_price, delta, gamma, theta, vega, rho, implied_volatility FROM option WHERE option_id = $1::uuid`,
		optionID,
	).Scan(&o.OptionID, &o.InstrumentID, &o.UnderlyingInstrumentID, &o.Strike, &o.Expiry, &o.OptionType, &o.RiskFreeRate, &o.Volatility, &o.BSPrice, &o.Delta, &o.Gamma, &o.Theta, &o.Vega, &o.Rho, &o.ImpliedVolatility)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, application.ErrNotFound
		}
		return nil, err
	}
	return &o, nil
}

func (r *OptionRepo) List(ctx context.Context, limit, offset int) ([]domain.Option, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT option_id::text, instrument_id::text, underlying_instrument_id::text, strike, expiry, option_type, risk_free_rate, volatility, bs_price, delta, gamma, theta, vega, rho, implied_volatility FROM option ORDER BY option_id LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Option
	for rows.Next() {
		var o domain.Option
		if err := rows.Scan(&o.OptionID, &o.InstrumentID, &o.UnderlyingInstrumentID, &o.Strike, &o.Expiry, &o.OptionType, &o.RiskFreeRate, &o.Volatility, &o.BSPrice, &o.Delta, &o.Gamma, &o.Theta, &o.Vega, &o.Rho, &o.ImpliedVolatility); err != nil {
			return nil, err
		}
		list = append(list, o)
	}
	return list, rows.Err()
}

func (r *OptionRepo) Add(ctx context.Context, o *domain.Option) (*domain.Option, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO option (option_id, instrument_id, underlying_instrument_id, strike, expiry, option_type, risk_free_rate, volatility, bs_price, delta, gamma, theta, vega, rho, implied_volatility) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		 RETURNING option_id::text, instrument_id::text, underlying_instrument_id::text, strike, expiry, option_type, risk_free_rate, volatility, bs_price, delta, gamma, theta, vega, rho, implied_volatility`,
		o.OptionID, o.InstrumentID, o.UnderlyingInstrumentID, o.Strike, o.Expiry, o.OptionType, o.RiskFreeRate, o.Volatility, o.BSPrice, o.Delta, o.Gamma, o.Theta, o.Vega, o.Rho, o.ImpliedVolatility,
	).Scan(&o.OptionID, &o.InstrumentID, &o.UnderlyingInstrumentID, &o.Strike, &o.Expiry, &o.OptionType, &o.RiskFreeRate, &o.Volatility, &o.BSPrice, &o.Delta, &o.Gamma, &o.Theta, &o.Vega, &o.Rho, &o.ImpliedVolatility)
	if err != nil {
		return nil, err
	}
	return o, nil
}

func (r *OptionRepo) AddMany(ctx context.Context, entities []domain.Option) ([]domain.Option, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO option (option_id, instrument_id, underlying_instrument_id, strike, expiry, option_type, risk_free_rate, volatility, bs_price, delta, gamma, theta, vega, rho, implied_volatility) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
			e.OptionID, e.InstrumentID, e.UnderlyingInstrumentID, e.Strike, e.Expiry, e.OptionType, e.RiskFreeRate, e.Volatility, e.BSPrice, e.Delta, e.Gamma, e.Theta, e.Vega, e.Rho, e.ImpliedVolatility)
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

func (r *OptionRepo) Save(ctx context.Context, o *domain.Option) (*domain.Option, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE option SET instrument_id=$2::uuid, underlying_instrument_id=$3::uuid, strike=$4, expiry=$5, option_type=$6, risk_free_rate=$7, volatility=$8, bs_price=$9, delta=$10, gamma=$11, theta=$12, vega=$13, rho=$14, implied_volatility=$15 WHERE option_id=$1::uuid`,
		o.OptionID, o.InstrumentID, o.UnderlyingInstrumentID, o.Strike, o.Expiry, o.OptionType, o.RiskFreeRate, o.Volatility, o.BSPrice, o.Delta, o.Gamma, o.Theta, o.Vega, o.Rho, o.ImpliedVolatility)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, application.ErrNotFound
	}
	return r.GetByID(ctx, o.OptionID)
}

func (r *OptionRepo) Remove(ctx context.Context, optionID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM option WHERE option_id=$1::uuid`, optionID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
