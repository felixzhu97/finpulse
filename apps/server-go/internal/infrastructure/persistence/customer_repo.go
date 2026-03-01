package persistence

import (
	"context"
	"time"

	"finpulse/server-go/internal/domain"

	"github.com/jackc/pgx/v5"
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
		`SELECT customer_id::text, name, email, kyc_status, created_at FROM customer WHERE customer_id = $1::uuid`,
		customerID,
	).Scan(&c.CustomerID, &c.Name, &c.Email, &c.KYCStatus, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CustomerRepo) List(ctx context.Context, limit, offset int) ([]domain.Customer, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT customer_id::text, name, email, kyc_status, created_at FROM customer ORDER BY created_at LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Customer
	for rows.Next() {
		var c domain.Customer
		if err := rows.Scan(&c.CustomerID, &c.Name, &c.Email, &c.KYCStatus, &c.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, rows.Err()
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

func (r *CustomerRepo) Add(ctx context.Context, c *domain.Customer) (*domain.Customer, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO customer (customer_id, name, email, kyc_status) VALUES ($1::uuid, $2, $3, $4)
		 RETURNING customer_id::text, name, email, kyc_status, created_at`,
		c.CustomerID, c.Name, c.Email, c.KYCStatus,
	).Scan(&c.CustomerID, &c.Name, &c.Email, &c.KYCStatus, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (r *CustomerRepo) AddMany(ctx context.Context, entities []domain.Customer) ([]domain.Customer, error) {
	if len(entities) == 0 {
		return nil, nil
	}
	batch := &pgx.Batch{}
	for _, e := range entities {
		batch.Queue(`INSERT INTO customer (customer_id, name, email, kyc_status) VALUES ($1::uuid, $2, $3, $4)`,
			e.CustomerID, e.Name, e.Email, e.KYCStatus)
	}
	br := r.pool.SendBatch(ctx, batch)
	defer br.Close()
	now := time.Now().UTC()
	for range entities {
		if _, err := br.Exec(); err != nil {
			return nil, err
		}
	}
	for i := range entities {
		entities[i].CreatedAt = now
	}
	return entities, nil
}

func (r *CustomerRepo) Save(ctx context.Context, c *domain.Customer) (*domain.Customer, error) {
	res, err := r.pool.Exec(ctx,
		`UPDATE customer SET name=$2, email=$3, kyc_status=$4 WHERE customer_id=$1::uuid`,
		c.CustomerID, c.Name, c.Email, c.KYCStatus)
	if err != nil {
		return nil, err
	}
	if res.RowsAffected() == 0 {
		return nil, pgx.ErrNoRows
	}
	return r.GetByID(ctx, c.CustomerID)
}

func (r *CustomerRepo) Remove(ctx context.Context, customerID string) (bool, error) {
	res, err := r.pool.Exec(ctx, `DELETE FROM customer WHERE customer_id=$1::uuid`, customerID)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
