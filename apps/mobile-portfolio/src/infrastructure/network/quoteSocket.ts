import type { QuoteStreamHandle, QuoteStreamOptions } from "../services/quoteStreamTypes";

export function createQuoteSocket(options: QuoteStreamOptions): QuoteStreamHandle {
  let closed = false;
  let symbols = options.symbols ?? [];

  options.onStatusChange?.("idle");

  return {
    updateSymbols(next: string[]) {
      if (closed) return;
      symbols = next ?? [];
    },
    close() {
      closed = true;
      options.onStatusChange?.("closed");
    },
  };
}
