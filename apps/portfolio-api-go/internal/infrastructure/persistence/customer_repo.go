package persistence

import (
	"context"

	"finpulse/portfolio-api-go/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type CustomerRepo struct {
	pool *pgxpool.Pool
}

func NewCustomerRepo(pool *pgxpool.Pool) *CustomerRepo {
	return &CustomerRepo{pool: pool}
}

func (r *CustomerRepo) GetByID(ctx context.Context, customerID string) (*domain.Customer, error) {
	var c domain.Customer
	err := r.pool.QueryRow(ctx,
		`SELECT customer_id::text, name, email, kyc_status, created_at FROM customer WHERE customer_id = $1`,
		customerID,
	).Scan(&c.CustomerID, &c.Name, &c.Email, &c.KYCStatus, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CustomerRepo) Insert(ctx context.Context, name string, email *string, kycStatus *string) (*domain.Customer, error) {
	var c domain.Customer
	err := r.pool.QueryRow(ctx,
		`INSERT INTO customer (name, email, kyc_status) VALUES ($1, $2, $3)
		 RETURNING customer_id::text, name, email, kyc_status, created_at`,
		name, email, kycStatus,
	).Scan(&c.CustomerID, &c.Name, &c.Email, &c.KYCStatus, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
