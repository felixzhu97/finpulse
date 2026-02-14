import { useCallback, useMemo } from "react";
import type { Instrument } from "@/src/lib/types/instrument";
import type { Watchlist } from "@/src/lib/types/watchlist";
import { container } from "@/src/lib/services/DependencyContainer";
import type { WatchlistWithItems } from "../lib/services/WatchlistUseCase";
import { useAsyncLoad } from "./useAsyncLoad";

export type { WatchlistWithItems };

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

const EMPTY: { watchlists: WatchlistWithItems[]; instruments: Instrument[] } = {
  watchlists: [],
  instruments: [],
};

export function useWatchlists(): UseWatchlistsResult {
  const useCase = useMemo(() => container.getWatchlistUseCase(), []);
  const fetcher = useCallback(() => useCase.getWatchlists(), [useCase]);
  const { data, loading, error, refresh } = useAsyncLoad(fetcher, EMPTY);

  const watchlists = data?.watchlists ?? [];
  const instruments = data?.instruments ?? [];

  const addItem = useCallback(
    async (watchlistId: string, instrumentId: string) => {
      const item = await useCase.addItem(watchlistId, instrumentId);
      if (item) {
        await refresh();
        return true;
      }
      return false;
    },
    [refresh, useCase]
  );

  const removeItem = useCallback(
    async (watchlistItemId: string) => {
      const ok = await useCase.removeItem(watchlistItemId);
      if (ok) await refresh();
      return ok;
    },
    [refresh, useCase]
  );

  const createWatchlist = useCallback(
    async (name: string) => {
      const created = await useCase.createWatchlist(name);
      if (created) await refresh();
      return created;
    },
    [refresh, useCase]
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
