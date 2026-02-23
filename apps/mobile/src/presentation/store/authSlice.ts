import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Customer } from "../../domain/entities/customer";

const AUTH_STORAGE_KEY = "@finpulse/auth_token";

export interface AuthState {
  token: string | null;
  customer: Customer | null;
  restored: boolean;
}

const initialState: AuthState = {
  token: null,
  customer: null,
  restored: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{ token: string; customer: Customer | null }>
    ) {
      state.token = action.payload.token;
      state.customer = action.payload.customer;
      state.restored = true;
    },
    setCustomer(state, action: PayloadAction<Customer | null>) {
      state.customer = action.payload;
    },
    clearAuth(state) {
      state.token = null;
      state.customer = null;
      state.restored = true;
    },
    setRestored(state, action: PayloadAction<boolean>) {
      state.restored = action.payload;
    },
  },
});

export const { setAuth, setCustomer, clearAuth, setRestored } = authSlice.actions;
export const getAuthStorageKey = () => AUTH_STORAGE_KEY;
export default authSlice.reducer;
