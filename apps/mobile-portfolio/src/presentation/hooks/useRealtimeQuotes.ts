import { useEffect, useMemo, useState } from "react";
import {
  createQuoteSocket,
  type QuoteConnectionStatus,
  type QuoteSnapshot,
} from "../../infrastructure/api/quoteSocket";

export interface UseRealtimeQuotesResult {
  quotes: QuoteSnapshot;
  status: QuoteConnectionStatus;
}

export function useRealtimeQuotes(symbols: string[]): UseRealtimeQuotesResult {
  const [quotes, setQuotes] = useState<QuoteSnapshot>({});
  const [status, setStatus] = useState<QuoteConnectionStatus>("idle");

  const cleanedSymbols = useMemo(
    () =>
      Array.from(
        new Set(
          symbols.map((s) => s.toUpperCase()).filter((s) => s.length > 0)
        )
      ),
    [symbols]
  );

  useEffect(() => {
    if (cleanedSymbols.length === 0) {
      setQuotes({});
      setStatus("idle");
      return;
    }
    const handle = createQuoteSocket({
      symbols: cleanedSymbols,
      onSnapshot: (next) => setQuotes(next),
      onStatusChange: (next) => setStatus(next),
    });
    return () => handle.close();
  }, [cleanedSymbols.join(",")]);

  return { quotes, status };
}
