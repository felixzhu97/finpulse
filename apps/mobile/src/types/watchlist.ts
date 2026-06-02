export interface Watchlist {
  watchlist_id: string;
  customer_id: string;
  name: string;
  created_at: string;
}

export interface WatchlistItem {
  watchlist_item_id: string;
  watchlist_id: string;
  instrument_id: string;
  added_at: string;
}

export interface WatchlistCreate {
  customer_id: string;
  name: string;
}

export interface WatchlistItemCreate {
  watchlist_id: string;
  instrument_id: string;
}
