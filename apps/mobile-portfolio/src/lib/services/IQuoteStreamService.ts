import type { QuoteConnectionStatus, QuoteSnapshot } from "@/src/lib/types/quotes";

export interface QuoteStreamHandle {
  updateSymbols(symbols: string[]): void;
  close(): void;
}

export interface QuoteStreamOptions {
  symbols: string[];
  onSnapshot: (quotes: QuoteSnapshot) => void;
  onStatusChange?: (status: QuoteConnectionStatus) => void;
}

export interface IQuoteStreamService {
  subscribe(options: QuoteStreamOptions): QuoteStreamHandle;
}
