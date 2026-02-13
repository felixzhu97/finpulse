import type { QuoteData, QuoteSnapshot } from "../entities/quotes";

export interface IQuoteRepository {
  getQuotes(symbols: string[]): Promise<Record<string, QuoteData>>;
  getQuotesHistory(symbol: string, days?: number): Promise<number[]>;
}
