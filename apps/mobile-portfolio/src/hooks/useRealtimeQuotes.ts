import { useEffect, useMemo, useState } from "react";
import { createQuoteSocket, QuoteConnectionStatus, QuoteSnapshot } from "../services/quoteSocket";

export interface UseRealtimeQuotesResult {
  quotes: QuoteSnapshot;
  status: QuoteConnectionStatus;
}

export function useRealtimeQuotes(symbols: string[]): UseRealtimeQuotesResult {
  const [quotes, setQuotes] = useState<QuoteSnapshot>({});
  const [status, setStatus] = useState<QuoteConnectionStatus>("idle");

  const cleanedSymbols = useMemo(
    () => Array.from(new Set(symbols.map((s) => s.toUpperCase()).filter((s) => s.length > 0))),
    [symbols],
  );

  useEffect(() => {
    if (cleanedSymbols.length === 0) {
      setQuotes({});
      setStatus("idle");
      return;
    }
    const handle = createQuoteSocket({
      symbols: cleanedSymbols,
      onSnapshot: (next) => {
        console.log("quotes snapshot", next);   // 新增
        setQuotes(next);
      },
      onStatusChange: (next) => {
        console.log("quotes status", next);     // 新增
        setStatus(next);
      },
    });
    return () => {
      handle.close();
    };
  }, [cleanedSymbols.join(",")]);

  return { quotes, status };
}

