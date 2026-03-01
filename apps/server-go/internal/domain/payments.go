package domain

import "time"

type CashTransaction struct {
	TransactionID string    `json:"transaction_id"`
	AccountID     string    `json:"account_id"`
	Type          string    `json:"type"`
	Amount        float64   `json:"amount"`
	Currency      string    `json:"currency"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}

type Payment struct {
	PaymentID   string    `json:"payment_id"`
	AccountID   string    `json:"account_id"`
	Counterparty *string  `json:"counterparty,omitempty"`
	Amount      float64   `json:"amount"`
	Currency    string    `json:"currency"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type Settlement struct {
	SettlementID string     `json:"settlement_id"`
	TradeID      string     `json:"trade_id"`
	PaymentID    string     `json:"payment_id"`
	Status       string     `json:"status"`
	SettledAt    *time.Time `json:"settled_at,omitempty"`
}
