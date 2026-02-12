import { useCallback, useEffect, useState } from "react";
import type { Watchlist, WatchlistItem } from "../../domain/entities/watchlist";
import type { Instrument } from "../../domain/entities/instrument";
import { container } from "../../application/services/DependencyContainer";

export interface WatchlistWithItems {
  watchlist: Watchlist;
  items: WatchlistItem[];
}

export interface UseWatchlistsResult {
  watchlists: WatchlistWithItems[];
  instruments: Instrument[];
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
  addItem: (watchlistId: string, instrumentId: string) => Promise<boolean>;
  removeItem: (watchlistItemId: string) => Promise<boolean>;
  createWatchlist: (name: string) => Promise<Watchlist | null>;
}

export function useWatchlists(): UseWatchlistsResult {
  const [watchlists, setWatchlists] = useState<WatchlistWithItems[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const customerRepository = container.getCustomerRepository();
  const watchlistRepository = container.getWatchlistRepository();
  const instrumentRepository = container.getInstrumentRepository();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const customer = await customerRepository.getFirst();
      if (!customer) {
        setWatchlists([]);
        setInstruments([]);
        setLoading(false);
        return;
      }
      const [listRes, itemsRes, instRes] = await Promise.all([
        watchlistRepository.listWatchlists(),
        watchlistRepository.listWatchlistItems(),
        instrumentRepository.list(),
      ]);
      const byCustomer = listRes.filter(
        (w) => w.customer_id === customer.customer_id
      );
      const itemsByWatchlist = new Map<string, WatchlistItem[]>();
      for (const item of itemsRes) {
        const arr = itemsByWatchlist.get(item.watchlist_id) ?? [];
        arr.push(item);
        itemsByWatchlist.set(item.watchlist_id, arr);
      }
      const withItems: WatchlistWithItems[] = byCustomer.map((watchlist) => ({
        watchlist,
        items: itemsByWatchlist.get(watchlist.watchlist_id) ?? [],
      }));
      setWatchlists(withItems);
      setInstruments(instRes);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [customerRepository, watchlistRepository, instrumentRepository]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const addItem = useCallback(
    async (watchlistId: string, instrumentId: string) => {
      const item = await watchlistRepository.addWatchlistItem({
        watchlist_id: watchlistId,
        instrument_id: instrumentId,
      });
      if (item) {
        await load();
        return true;
      }
      return false;
    },
    [load, watchlistRepository]
  );

  const removeItem = useCallback(
    async (watchlistItemId: string) => {
      const ok = await watchlistRepository.removeWatchlistItem(watchlistItemId);
      if (ok) await load();
      return ok;
    },
    [load, watchlistRepository]
  );

  const createWatchlist = useCallback(
    async (name: string) => {
      const customer = await customerRepository.getFirst();
      if (!customer) return null;
      const created = await watchlistRepository.createWatchlist({
        customer_id: customer.customer_id,
        name,
      });
      if (created) await load();
      return created;
    },
    [load, customerRepository, watchlistRepository]
  );

  return {
    watchlists,
    instruments,
    loading,
    error,
    refresh,
    addItem,
    removeItem,
    createWatchlist,
  };
}
