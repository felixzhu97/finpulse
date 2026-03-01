package domain

import "time"

type MarketData struct {
	DataID      string    `json:"data_id"`
	InstrumentID string   `json:"instrument_id"`
	Timestamp   time.Time `json:"timestamp"`
	Open        *float64  `json:"open,omitempty"`
	High        *float64  `json:"high,omitempty"`
	Low         *float64  `json:"low,omitempty"`
	Close       float64   `json:"close"`
	Volume      *float64  `json:"volume,omitempty"`
	ChangePct   *float64  `json:"change_pct,omitempty"`
}
