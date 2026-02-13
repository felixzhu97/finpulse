import type { QuoteSnapshot } from "@/src/types/quotes";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./storeInstance";

const selectQuotes = (s: RootState) => s.quotes.quotes;
const selectHistory = (s: RootState) => s.quotes.history;

export const selectStatus = (s: RootState) => s.quotes.status;
export const selectSubscribedSymbols = (s: RootState) => s.quotes.subscribedSymbols;
export const selectExtraSubscribedSymbols = (s: RootState) => s.quotes.extraSubscribedSymbols;

export const selectMergedSubscribedSymbols = createSelector(
  [selectSubscribedSymbols, selectExtraSubscribedSymbols],
  (main, extra) => Array.from(new Set([...main, ...extra]))
);

export const selectQuotesForSymbols = createSelector(
  [selectQuotes, (_: RootState, symbols: string[]) => symbols],
  (quotes, symbols): QuoteSnapshot => {
    const out: QuoteSnapshot = {};
    for (const sym of symbols) {
      const key = sym.toUpperCase();
      if (quotes[key]) out[key] = quotes[key];
    }
    return out;
  }
);

export const selectHistoryForSymbols = createSelector(
  [selectHistory, (_: RootState, symbols: string[]) => symbols],
  (history, symbols): Record<string, number[]> => {
    const out: Record<string, number[]> = {};
    for (const sym of symbols) {
      const key = sym.toUpperCase();
      if (history[key]) out[key] = history[key];
    }
    return out;
  }
);
