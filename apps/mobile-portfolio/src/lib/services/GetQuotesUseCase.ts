import type { QuoteData } from "@/src/types/quotes";
import type { IQuoteRepository } from "@/src/types/IQuoteRepository";

export class GetQuotesUseCase {
  constructor(private quoteRepository: IQuoteRepository) {}

  async execute(symbols: string[]): Promise<Record<string, QuoteData>> {
    return this.quoteRepository.getQuotes(symbols);
  }

  async getHistory(symbol: string, days?: number): Promise<number[]> {
    return this.quoteRepository.getQuotesHistory(symbol, days);
  }
}
