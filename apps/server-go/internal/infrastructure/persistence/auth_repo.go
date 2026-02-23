package persistence

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)


func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

const sessionTTL = 30 * 24 * time.Hour

type AuthRepo struct {
	pool *pgxpool.Pool
}

func NewAuthRepo(pool *pgxpool.Pool) *AuthRepo {
	return &AuthRepo{pool: pool}
}

func (r *AuthRepo) GetCredentialByEmail(ctx context.Context, email string) (customerID string, passwordHash string, found bool, err error) {
	err = r.pool.QueryRow(ctx,
		`SELECT customer_id::text, password_hash FROM user_credential WHERE email = $1`,
		email,
	).Scan(&customerID, &passwordHash)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", "", false, nil
	}
	if err != nil {
		return "", "", false, err
	}
	return customerID, passwordHash, true, nil
}

func (r *AuthRepo) AddCredential(ctx context.Context, customerID, email, passwordHash string) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO user_credential (customer_id, email, password_hash) VALUES ($1::uuid, $2, $3)`,
		customerID, email, passwordHash,
	)
	return err
}

func (r *AuthRepo) CreateSession(ctx context.Context, customerID string) (token string, err error) {
	token, err = generateToken()
	if err != nil {
		return "", err
	}
	expiresAt := time.Now().UTC().Add(sessionTTL)
	_, err = r.pool.Exec(ctx,
		`INSERT INTO session (customer_id, token, expires_at) VALUES ($1::uuid, $2, $3)`,
		customerID, token, expiresAt,
	)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (r *AuthRepo) GetCustomerIDByToken(ctx context.Context, token string) (customerID string, found bool, err error) {
	err = r.pool.QueryRow(ctx,
		`SELECT customer_id::text FROM session WHERE token = $1 AND expires_at > now()`,
		token,
	).Scan(&customerID)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	return customerID, true, nil
}

func (r *AuthRepo) DeleteSessionByToken(ctx context.Context, token string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM session WHERE token = $1`, token)
	return err
}

func (r *AuthRepo) UpdatePasswordHash(ctx context.Context, customerID, passwordHash string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE user_credential SET password_hash = $1 WHERE customer_id = $2::uuid`,
		passwordHash, customerID,
	)
	return err
}
