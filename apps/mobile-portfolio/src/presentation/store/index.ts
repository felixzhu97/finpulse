import { configureStore } from "@reduxjs/toolkit";
import quotesReducer from "./quotesSlice";
import preferencesReducer from "./preferencesSlice";
import portfolioReducer from "./portfolioSlice";

export const store = configureStore({
  reducer: {
    quotes: quotesReducer,
    preferences: preferencesReducer,
    portfolio: portfolioReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { useAppDispatch, useAppSelector } from "./useAppStore";
export { usePortfolioStore } from "./usePortfolioStore";
