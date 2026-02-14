import { useEffect, useMemo } from "react";
import type { QuoteConnectionStatus } from "../../domain/entities/quotes";
import { shallowEqual } from "react-redux";
import { useAppDispatch, useAppSelector } from "../store";
import {
  selectQuotesForSymbols,
  selectHistoryForSymbols,
  selectStatus,
} from "../store/quotesSelectors";
import { setSubscribedSymbols } from "../store/quotesSlice";

export interface SymbolDisplayData {
  price: number;
  change: number;
  volume?: number;
  history: number[];
}

export interface UseSymbolDisplayDataResult {
  bySymbol: Record<string, SymbolDisplayData>;
  quoteMap: Record<string, { price: number; change: number; volume?: number }>;
  historyBySymbol: Record<string, number[]>;
  status: QuoteConnectionStatus;
}

export function useSymbolDisplayData(
  symbols: string[],
  initialPrices: Record<string, number> = {}
): UseSymbolDisplayDataResult {
  const dispatch = useAppDispatch();
  const quotes = useAppSelector(
    (s) => selectQuotesForSymbols(s, symbols),
    shallowEqual
  );
  const history = useAppSelector(
    (s) => selectHistoryForSymbols(s, symbols),
    shallowEqual
  );
  const status = useAppSelector(selectStatus);

  useEffect(() => {
    dispatch(setSubscribedSymbols(symbols));
  }, [symbols.join(","), dispatch]);

  const quoteMap = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(quotes).map(([k, v]) => [
          k,
          { price: v.price, change: v.change, volume: v.volume },
        ])
      ),
    [quotes]
  );

  const historyBySymbol = useMemo(
    () =>
      Object.fromEntries(
        symbols.map((sym) => [sym.toUpperCase(), history[sym.toUpperCase()] ?? []])
      ),
    [symbols, history]
  );

  const bySymbol = useMemo(() => {
    const out: Record<string, SymbolDisplayData> = {};
    for (const sym of symbols) {
      const key = sym.toUpperCase();
      const q = quotes[key];
      const hist = historyBySymbol[key] ?? [];
      const price = q?.price ?? initialPrices[key] ?? 0;
      out[key] = {
        price,
        change: q?.change ?? 0,
        volume: q?.volume,
        history: hist,
      };
    }
    return out;
  }, [symbols, quotes, historyBySymbol, initialPrices]);

  return { bySymbol, quoteMap, historyBySymbol, status };
}
