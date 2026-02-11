import { useCallback, useEffect, useState } from "react";
import type { Watchlist, WatchlistItem, Instrument } from "@/src/types";
import { customersApi, watchlistsApi, instrumentsApi } from "@/src/api";

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const customer = await customersApi.getFirst();
      if (!customer) {
        setWatchlists([]);
        setInstruments([]);
        setLoading(false);
        return;
      }
      const [listRes, itemsRes, instRes] = await Promise.all([
        watchlistsApi.listWatchlists(),
        watchlistsApi.listWatchlistItems(),
        instrumentsApi.list(),
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const addItem = useCallback(
    async (watchlistId: string, instrumentId: string): Promise<boolean> => {
      const ok = await watchlistsApi.addWatchlistItem({
        watchlist_id: watchlistId,
        instrument_id: instrumentId,
      });
      if (ok) await load();
      return ok;
    },
    [load]
  );

  const removeItem = useCallback(
    async (watchlistItemId: string): Promise<boolean> => {
      const ok = await watchlistsApi.removeWatchlistItem(watchlistItemId);
      if (ok) await load();
      return ok;
    },
    [load]
  );

  const createWatchlist = useCallback(
    async (name: string): Promise<Watchlist | null> => {
      const customer = await customersApi.getFirst();
      if (!customer) return null;
      const created = await watchlistsApi.createWatchlist({
        customer_id: customer.customer_id,
        name,
      });
      if (created) await load();
      return created;
    },
    [load]
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
