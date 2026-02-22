package domain

import "time"

type Customer struct {
	CustomerID string    `json:"customer_id"`
	Name       string    `json:"name"`
	Email      *string   `json:"email"`
	KYCStatus  *string   `json:"kyc_status,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}
