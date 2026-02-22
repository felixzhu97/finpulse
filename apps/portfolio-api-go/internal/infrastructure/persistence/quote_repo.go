package persistence

import (
	"context"

	"finpulse/portfolio-api-go/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type QuoteRepo struct {
	pool *pgxpool.Pool
}

func NewQuoteRepo(pool *pgxpool.Pool) *QuoteRepo {
	return &QuoteRepo{pool: pool}
}

func (r *QuoteRepo) GetBySymbols(ctx context.Context, symbols []string) ([]domain.Quote, error) {
	if len(symbols) == 0 {
		return nil, nil
	}
	rows, err := r.pool.Query(ctx,
		`SELECT symbol, price::float8, change::float8, change_rate::float8 FROM realtime_quote WHERE symbol = ANY($1)`,
		symbols,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []domain.Quote
	for rows.Next() {
		var q domain.Quote
		if err := rows.Scan(&q.Symbol, &q.Price, &q.Change, &q.ChangeRate); err != nil {
			return nil, err
		}
		out = append(out, q)
	}
	return out, rows.Err()
}
