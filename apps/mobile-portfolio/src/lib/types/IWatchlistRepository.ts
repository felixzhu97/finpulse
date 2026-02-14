import type {
  Watchlist,
  WatchlistItem,
  WatchlistCreate,
  WatchlistItemCreate,
} from "@/src/lib/types/watchlist";

export interface IWatchlistRepository {
  listWatchlists(limit?: number, offset?: number): Promise<Watchlist[]>;
  getWatchlist(watchlistId: string): Promise<Watchlist | null>;
  createWatchlist(body: WatchlistCreate): Promise<Watchlist | null>;
  listWatchlistItems(limit?: number, offset?: number): Promise<WatchlistItem[]>;
  addWatchlistItem(body: WatchlistItemCreate): Promise<WatchlistItem | null>;
  removeWatchlistItem(watchlistItemId: string): Promise<boolean>;
}
