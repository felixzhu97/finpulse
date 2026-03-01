package domain

import "time"

type PortfolioSchema struct {
	PortfolioID  string    `json:"portfolio_id"`
	AccountID    string    `json:"account_id"`
	Name         string    `json:"name"`
	BaseCurrency string    `json:"base_currency"`
	CreatedAt    time.Time `json:"created_at"`
}

type Position struct {
	PositionID   string    `json:"position_id"`
	PortfolioID  string    `json:"portfolio_id"`
	InstrumentID string    `json:"instrument_id"`
	Quantity     float64   `json:"quantity"`
	CostBasis    *float64  `json:"cost_basis,omitempty"`
	AsOfDate     string    `json:"as_of_date"`
}
