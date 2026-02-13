import type {
  Watchlist,
  WatchlistItem,
  WatchlistCreate,
  WatchlistItemCreate,
} from "../../domain/entities/watchlist";
import type { IWatchlistRepository } from "../../domain/repositories/IWatchlistRepository";
import { httpClient } from "@/src/infrastructure/network/httpClient";

export class WatchlistRepository implements IWatchlistRepository {
  async listWatchlists(limit = 100, offset = 0): Promise<Watchlist[]> {
    return httpClient.getList<Watchlist>("watchlists", limit, offset);
  }

  async getWatchlist(watchlistId: string): Promise<Watchlist | null> {
    return httpClient.getById<Watchlist>("watchlists", watchlistId);
  }

  async createWatchlist(body: WatchlistCreate): Promise<Watchlist | null> {
    return httpClient.post<Watchlist>("watchlists", body);
  }

  async listWatchlistItems(limit = 500, offset = 0): Promise<WatchlistItem[]> {
    return httpClient.getList<WatchlistItem>("watchlist-items", limit, offset);
  }

  async addWatchlistItem(body: WatchlistItemCreate): Promise<WatchlistItem | null> {
    return httpClient.post<WatchlistItem>("watchlist-items", body);
  }

  async removeWatchlistItem(watchlistItemId: string): Promise<boolean> {
    return httpClient.delete("watchlist-items", watchlistItemId);
  }
}
