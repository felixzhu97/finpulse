import type { QuoteSnapshot } from "../types";
import { httpClient } from "./httpClient";

export async function getQuotes(symbols: string[]): Promise<QuoteSnapshot> {
  const cleaned = symbols
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0);
  if (cleaned.length === 0) return {};
  const query = new URLSearchParams({ symbols: cleaned.join(",") }).toString();
  const path = `/api/v1/quotes?${query}`;
  const result = await httpClient.get<QuoteSnapshot>(path);
  return result ?? {};
}
