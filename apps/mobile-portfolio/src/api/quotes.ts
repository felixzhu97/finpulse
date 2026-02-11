import type { QuoteSnapshot } from "../types";
import { httpClient } from "./httpClient";

export async function getQuotes(symbols: string[]): Promise<QuoteSnapshot> {
  const cleaned = symbols
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0);
  if (cleaned.length === 0) return {};
  const query = new URLSearchParams({ symbols: cleaned.join(",") }).toString();
  const result = await httpClient.get<QuoteSnapshot>(`/api/v1/quotes?${query}`);
  return result ?? {};
}

export type QuoteHistoryResponse = Record<string, number[]>;

export async function getQuotesHistory(
  symbols: string[],
  minutes = 5
): Promise<QuoteHistoryResponse> {
  const cleaned = symbols
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0);
  if (cleaned.length === 0) return {};
  const params = new URLSearchParams({
    symbols: cleaned.join(","),
    minutes: String(minutes),
  }).toString();
  const result = await httpClient.get<QuoteHistoryResponse>(
    `/api/v1/quotes/history?${params}`
  );
  return result ?? {};
}
