import type { QuoteData } from "@/src/lib/types/quotes";
import type { IQuoteRepository } from "@/src/lib/types/IQuoteRepository";
import { httpClient } from "@/src/lib/network/httpClient";

export class QuoteRepository implements IQuoteRepository {
  async getQuotes(symbols: string[]): Promise<Record<string, QuoteData>> {
    const cleaned = symbols
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);
    if (cleaned.length === 0) return {};
    const query = new URLSearchParams({ symbols: cleaned.join(",") }).toString();
    const result = await httpClient.get<Record<string, QuoteData>>(`/api/v1/quotes?${query}`);
    return result ?? {};
  }

  async getQuotesHistory(symbol: string, days = 30): Promise<number[]> {
    const cleaned = symbol.trim().toUpperCase();
    if (!cleaned) return [];
    const minutes = Math.min(60, days * 24 * 60);
    const params = new URLSearchParams({
      symbols: cleaned,
      minutes: String(minutes),
    }).toString();
    const result = await httpClient.get<Record<string, number[]>>(
      `/api/v1/quotes/history?${params}`
    );
    return result?.[cleaned] ?? [];
  }
}
