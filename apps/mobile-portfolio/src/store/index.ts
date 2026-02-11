import { configureStore } from "@reduxjs/toolkit";
import quotesReducer from "./quotesSlice";
import preferencesReducer from "./preferencesSlice";

export const store = configureStore({
  reducer: {
    quotes: quotesReducer,
    preferences: preferencesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
