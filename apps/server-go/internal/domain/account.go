package domain

import "time"

type Account struct {
	AccountID   string    `json:"account_id"`
	CustomerID  string    `json:"customer_id"`
	AccountType string    `json:"account_type"`
	Currency    string    `json:"currency"`
	Status      string    `json:"status"`
	OpenedAt    time.Time `json:"opened_at"`
}
