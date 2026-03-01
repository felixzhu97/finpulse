package domain

import "time"

type Watchlist struct {
	WatchlistID string    `json:"watchlist_id"`
	CustomerID  string    `json:"customer_id"`
	Name        string    `json:"name"`
	CreatedAt   time.Time `json:"created_at"`
}

type WatchlistItem struct {
	WatchlistItemID string    `json:"watchlist_item_id"`
	WatchlistID     string    `json:"watchlist_id"`
	InstrumentID    string    `json:"instrument_id"`
	AddedAt         time.Time `json:"added_at"`
}
