import type { Instrument } from "@/src/lib/types/instrument";
import type { Watchlist, WatchlistItem } from "@/src/lib/types/watchlist";
import type { ICustomerRepository } from "@/src/lib/types/ICustomerRepository";
import type { IInstrumentRepository } from "@/src/lib/types/IInstrumentRepository";
import type { IWatchlistRepository } from "@/src/lib/types/IWatchlistRepository";

export interface WatchlistWithItems {
  watchlist: Watchlist;
  items: WatchlistItem[];
}

export class WatchlistUseCase {
  constructor(
    private customerRepository: ICustomerRepository,
    private watchlistRepository: IWatchlistRepository,
    private instrumentRepository: IInstrumentRepository
  ) {}

  async getWatchlists(): Promise<{ watchlists: WatchlistWithItems[]; instruments: Instrument[] }> {
    const customer = await this.customerRepository.getFirst();
    if (!customer) return { watchlists: [], instruments: [] };

    const [listRes, itemsRes, instRes] = await Promise.all([
      this.watchlistRepository.listWatchlists(),
      this.watchlistRepository.listWatchlistItems(),
      this.instrumentRepository.list(),
    ]);

    const byCustomer = listRes.filter((w) => w.customer_id === customer.customer_id);
    const itemsByWatchlist = new Map<string, WatchlistItem[]>();
    for (const item of itemsRes) {
      const arr = itemsByWatchlist.get(item.watchlist_id) ?? [];
      arr.push(item);
      itemsByWatchlist.set(item.watchlist_id, arr);
    }

    const watchlists: WatchlistWithItems[] = byCustomer.map((watchlist) => ({
      watchlist,
      items: itemsByWatchlist.get(watchlist.watchlist_id) ?? [],
    }));

    return { watchlists, instruments: instRes };
  }

  async addItem(watchlistId: string, instrumentId: string): Promise<WatchlistItem | null> {
    return this.watchlistRepository.addWatchlistItem({
      watchlist_id: watchlistId,
      instrument_id: instrumentId,
    });
  }

  async removeItem(watchlistItemId: string): Promise<boolean> {
    return this.watchlistRepository.removeWatchlistItem(watchlistItemId);
  }

  async createWatchlist(name: string): Promise<Watchlist | null> {
    const customer = await this.customerRepository.getFirst();
    if (!customer) return null;
    return this.watchlistRepository.createWatchlist({
      customer_id: customer.customer_id,
      name,
    });
  }
}
