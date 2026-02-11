import type { QuoteConnectionStatus, QuoteSnapshot } from "@/src/types/quotes";
import { createSlice } from "@reduxjs/toolkit";

const MAX_HISTORY_POINTS = 45;

interface QuotesState {
  quotes: QuoteSnapshot;
  history: Record<string, number[]>;
  status: QuoteConnectionStatus;
  subscribedSymbols: string[];
}

const initialState: QuotesState = {
  quotes: {},
  history: {},
  status: "idle",
  subscribedSymbols: [],
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
    setSubscribedSymbols(state, action: { payload: string[] }) {
      state.subscribedSymbols = Array.from(
        new Set(action.payload.map((s) => s.toUpperCase()))
      );
    },
    setSnapshot(state, action: { payload: QuoteSnapshot }) {
      for (const [sym, data] of Object.entries(action.payload)) {
        const key = sym.toUpperCase();
        state.quotes[key] = data;
        state.history[key] = appendHistory(state.history[key], data.price);
      }
    },
    setStatus(state, action: { payload: QuoteConnectionStatus }) {
      state.status = action.payload;
    },
  },
});

export const { setSubscribedSymbols, setSnapshot, setStatus } = quotesSlice.actions;
export default quotesSlice.reducer;
