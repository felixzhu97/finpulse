package domain

import "time"

type Order struct {
	OrderID     string    `json:"order_id"`
	AccountID   string    `json:"account_id"`
	InstrumentID string   `json:"instrument_id"`
	Side        string    `json:"side"`
	Quantity    float64   `json:"quantity"`
	OrderType   string    `json:"order_type"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type Trade struct {
	TradeID    string    `json:"trade_id"`
	OrderID    string    `json:"order_id"`
	Quantity   float64   `json:"quantity"`
	Price      float64   `json:"price"`
	Fee        *float64  `json:"fee,omitempty"`
	ExecutedAt time.Time `json:"executed_at"`
}
