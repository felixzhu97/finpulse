package domain

import "time"

type Option struct {
	OptionID              string    `json:"option_id"`
	InstrumentID          string    `json:"instrument_id"`
	UnderlyingInstrumentID string   `json:"underlying_instrument_id"`
	Strike                float64   `json:"strike"`
	Expiry                time.Time `json:"expiry"`
	OptionType            string    `json:"option_type"`
	RiskFreeRate          *float64  `json:"risk_free_rate,omitempty"`
	Volatility            *float64  `json:"volatility,omitempty"`
	BSPrice               *float64  `json:"bs_price,omitempty"`
	Delta                 *float64  `json:"delta,omitempty"`
	Gamma                 *float64  `json:"gamma,omitempty"`
	Theta                 *float64  `json:"theta,omitempty"`
	Vega                  *float64  `json:"vega,omitempty"`
	Rho                   *float64  `json:"rho,omitempty"`
	ImpliedVolatility     *float64  `json:"implied_volatility,omitempty"`
}
