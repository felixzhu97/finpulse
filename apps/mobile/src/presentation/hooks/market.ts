import { useCallback, useEffect, useMemo } from "react";
import type { Instrument } from "../../domain/entities/instrument";
import type { Watchlist } from "../../domain/entities/watchlist";
import type { WatchlistWithItems } from "../../domain/dto";
import {
  getWatchlists,
  addWatchlistItem as apiAddWatchlistItem,
  removeWatchlistItem as apiRemoveWatchlistItem,
  createWatchlist as apiCreateWatchlist,
  getQuotes,
  getQuotesHistoryBatch,
} from "../../infrastructure/api";
import { useAsyncLoad } from "./common";
import type { QuoteConnectionStatus } from "../../domain/entities/quotes";
import { shallowEqual } from "react-redux";
import { useAppDispatch, useAppSelector } from "../store";
import {
  selectQuotesForSymbols,
  selectHistoryForSymbols,
  selectStatus,
} from "../store/quotesSelectors";
import { setSubscribedSymbols, setHistory, setSnapshot } from "../store/quotesSlice";

export type { WatchlistWithItems };

export interface SymbolDisplayData {
  price: number;
  change: number;
  volume?: number;
  history: number[];
}

export interface UseSymbolDisplayDataResult {
  bySymbol: Record<string, SymbolDisplayData>;
  quoteMap: Record<string, { price: number; change: number; volume?: number }>;
  historyBySymbol: Record<string, number[]>;
  status: QuoteConnectionStatus;
}

export function useSymbolDisplayData(
  symbols: string[],
  initialPrices: Record<string, number> = {},
  subscribeSymbols?: string[]
): UseSymbolDisplayDataResult {
  const dispatch = useAppDispatch();
  const quotes = useAppSelector(
    (s) => selectQuotesForSymbols(s, symbols),
    shallowEqual
  );
  const history = useAppSelector(
    (s) => selectHistoryForSymbols(s, symbols),
    shallowEqual
  );
  const status = useAppSelector(selectStatus);
  const toSubscribe = subscribeSymbols !== undefined && subscribeSymbols.length > 0
    ? subscribeSymbols
    : symbols;

  useEffect(() => {
    dispatch(setSubscribedSymbols(toSubscribe));
  }, [toSubscribe.join(","), dispatch]);

  const quoteMap = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(quotes).map(([k, v]) => [
          k,
          { price: v.price, change: v.change, volume: v.volume },
        ])
      ),
    [quotes]
  );

  const historyBySymbol = useMemo(
    () =>
      Object.fromEntries(
        symbols.map((sym) => [sym.toUpperCase(), history[sym.toUpperCase()] ?? []])
      ),
    [symbols, history]
  );

  const bySymbol = useMemo(() => {
    const out: Record<string, SymbolDisplayData> = {};
    for (const sym of symbols) {
      const key = sym.toUpperCase();
      const q = quotes[key];
      const hist = historyBySymbol[key] ?? [];
      const price = q?.price ?? initialPrices[key] ?? 0;
      out[key] = {
        price,
        change: q?.change ?? 0,
        volume: q?.volume,
        history: hist,
      };
    }
    return out;
  }, [symbols, quotes, historyBySymbol, initialPrices]);

  return { bySymbol, quoteMap, historyBySymbol, status };
}

const EMPTY: { watchlists: WatchlistWithItems[]; instruments: Instrument[] } = {
  watchlists: [],
  instruments: [],
};

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
  const fetcher = useCallback(() => getWatchlists(), []);
  const { data, loading, error, refresh } = useAsyncLoad(fetcher, EMPTY);

  const watchlists = data?.watchlists ?? [];
  const instruments = data?.instruments ?? [];

  const addItem = useCallback(
    async (watchlistId: string, instrumentId: string) => {
      const item = await apiAddWatchlistItem(watchlistId, instrumentId);
      if (item) {
        await refresh();
        return true;
      }
      return false;
    },
    [refresh]
  );

  const removeItem = useCallback(
    async (watchlistItemId: string) => {
      const ok = await apiRemoveWatchlistItem(watchlistItemId);
      if (ok) await refresh();
      return ok;
    },
    [refresh]
  );

  const createWatchlist = useCallback(
    async (name: string) => {
      const created = await apiCreateWatchlist(name);
      if (created) await refresh();
      return created;
    },
    [refresh]
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

export function useQuotesForSymbols(symbols: string[]) {
  const dispatch = useAppDispatch();

  const refreshQuotes = useCallback(async () => {
    if (symbols.length === 0) return;
    getQuotesHistoryBatch(symbols, 5)
      .then((data) => dispatch(setHistory(data ?? {})))
      .catch(() => dispatch(setHistory({})));
    getQuotes(symbols)
      .then((data) => dispatch(setSnapshot(data ?? {})))
      .catch(() => dispatch(setSnapshot({})));
  }, [symbols.join(","), dispatch]);

  useEffect(() => {
    refreshQuotes();
  }, [refreshQuotes]);

  return { refreshQuotes };
}
