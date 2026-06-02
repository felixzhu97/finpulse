import { configureStore } from "@reduxjs/toolkit";
import quotesReducer from "./quotesSlice";
import preferencesReducer from "./preferencesSlice";
import portfolioReducer from "./portfolioSlice";
import web3Reducer from "./web3Slice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    quotes: quotesReducer,
    preferences: preferencesReducer,
    portfolio: portfolioReducer,
    web3: web3Reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 128,
        ignoredPaths: ["quotes.quotes", "quotes.history"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
