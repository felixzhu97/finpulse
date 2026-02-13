import type { QuoteConnectionStatus, QuoteSnapshot } from "@/src/lib/types/quotes";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const MAX_HISTORY_POINTS = 45;

interface QuotesState {
  quotes: QuoteSnapshot;
  history: Record<string, number[]>;
  status: QuoteConnectionStatus;
  subscribedSymbols: string[];
  extraSubscribedSymbols: string[];
}

const initialState: QuotesState = {
  quotes: {},
  history: {},
  status: "idle",
  subscribedSymbols: [],
  extraSubscribedSymbols: [],
};

function appendHistory(prev: number[] | undefined, price: number): number[] {
  if (!prev || prev.length === 0) return [price];
  if (prev[prev.length - 1] === price) return prev;
  const next = [...prev, price];
  return next.length > MAX_HISTORY_POINTS ? next.slice(-MAX_HISTORY_POINTS) : next;
}

const quotesSlice = createSlice({
  name: "quotes",
  initialState,
  reducers: {
    setSubscribedSymbols(state, action: PayloadAction<string[]>) {
      state.subscribedSymbols = Array.from(
        new Set(action.payload.map((s) => s.toUpperCase()))
      );
    },
    setSnapshot(state, action: PayloadAction<QuoteSnapshot>) {
      for (const [sym, data] of Object.entries(action.payload)) {
        const key = sym.toUpperCase();
        state.quotes[key] = data;
        state.history[key] = appendHistory(state.history[key], data.price);
      }
    },
    setStatus(state, action: PayloadAction<QuoteConnectionStatus>) {
      state.status = action.payload;
    },
    setHistory(state, action: PayloadAction<Record<string, number[]>>) {
      for (const [sym, prices] of Object.entries(action.payload)) {
        const key = sym.toUpperCase();
        if (prices?.length) {
          state.history[key] = prices.slice(-MAX_HISTORY_POINTS);
        }
      }
    },
    setExtraSubscribedSymbols(state, action: PayloadAction<string[]>) {
      state.extraSubscribedSymbols = action.payload.map((s) => s.toUpperCase()).filter(Boolean);
    },
  },
});

export const { setSubscribedSymbols, setSnapshot, setStatus, setHistory, setExtraSubscribedSymbols } = quotesSlice.actions;
export default quotesSlice.reducer;
