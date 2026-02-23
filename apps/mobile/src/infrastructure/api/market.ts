import type { QuoteData } from "../../domain/entities/quotes";
import type { Watchlist, WatchlistItem } from "../../domain/entities/watchlist";
import type { Instrument } from "../../domain/entities/instrument";
import type { WatchlistWithItems } from "../../domain/dto";
import { httpClient } from "../network/httpClient";
import { getCustomerFirst } from "./account";

export async function getQuotes(
  symbols: string[]
): Promise<Record<string, QuoteData>> {
  const cleaned = symbols
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0);
  if (cleaned.length === 0) return {};
  const query = new URLSearchParams({ symbols: cleaned.join(",") }).toString();
  const result = await httpClient.get<Record<string, QuoteData>>(
    `/api/v1/quotes?${query}`
  );
  return result ?? {};
}

export async function getQuotesHistory(
  symbol: string,
  days = 30
): Promise<number[]> {
  const cleaned = symbol.trim().toUpperCase();
  if (!cleaned) return [];
  const data = await getQuotesHistoryBatch([cleaned], days);
  return data[cleaned] ?? [];
}

export async function getQuotesHistoryBatch(
  symbols: string[],
  days = 30
): Promise<Record<string, number[]>> {
  const cleaned = symbols
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0);
  if (cleaned.length === 0) return {};
  const minutes = Math.min(60, days * 24 * 60);
  const params = new URLSearchParams({
    symbols: cleaned.join(","),
    minutes: String(minutes),
  }).toString();
  const result = await httpClient.get<Record<string, number[]>>(
    `/api/v1/quotes/history?${params}`
  );
  const out: Record<string, number[]> = {};
  for (const sym of cleaned) {
    out[sym] = result?.[sym] ?? [];
  }
  return out;
}

export async function getWatchlists(): Promise<{
  watchlists: WatchlistWithItems[];
  instruments: Instrument[];
}> {
  const customer = await getCustomerFirst();
  if (!customer) return { watchlists: [], instruments: [] };
  const [listRes, itemsRes, instRes] = await Promise.all([
    httpClient.getList<Watchlist>("watchlists", 100, 0),
    httpClient.getList<WatchlistItem>("watchlist-items", 500, 0),
    httpClient.getList<Instrument>("instruments", 500, 0),
  ]);
  const byCustomer = listRes.filter((w: Watchlist) => w.customer_id === customer.customer_id);
  const itemsByWatchlist = new Map<string, WatchlistItem[]>();
  for (const item of itemsRes) {
    const arr = itemsByWatchlist.get(item.watchlist_id) ?? [];
    arr.push(item);
    itemsByWatchlist.set(item.watchlist_id, arr);
  }
  const watchlists: WatchlistWithItems[] = byCustomer.map((watchlist: Watchlist) => ({
    watchlist,
    items: itemsByWatchlist.get(watchlist.watchlist_id) ?? [],
  }));
  return { watchlists, instruments: instRes };
}

export async function addWatchlistItem(
  watchlistId: string,
  instrumentId: string
): Promise<WatchlistItem | null> {
  return httpClient.post<WatchlistItem>("watchlist-items", {
    watchlist_id: watchlistId,
    instrument_id: instrumentId,
  });
}

export async function removeWatchlistItem(
  watchlistItemId: string
): Promise<boolean> {
  return httpClient.delete("watchlist-items", watchlistItemId);
}

export async function createWatchlist(name: string): Promise<Watchlist | null> {
  const customer = await getCustomerFirst();
  if (!customer) return null;
  return httpClient.post<Watchlist>("watchlists", {
    customer_id: customer.customer_id,
    name,
  });
}
