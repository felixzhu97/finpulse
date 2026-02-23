import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { WalletInfo } from "@/src/domain/entities/blockchain";
import { web3Service } from "@/src/infrastructure/services";
import { getWeb3Config } from "@/src/infrastructure/config/web3Config";

interface Web3State {
  walletInfo: WalletInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: Web3State = {
  walletInfo: null,
  loading: false,
  error: null,
};

export const connectWallet = createAsyncThunk<
  WalletInfo | null,
  string | undefined,
  { rejectValue: string }
>("web3/connect", async (privateKey, { rejectWithValue }) => {
  try {
    if (!web3Service.isInitialized()) {
      web3Service.initialize(getWeb3Config());
    }
    const info = await web3Service.connectWallet(privateKey);
    return info;
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : "Failed to connect wallet");
  }
});

export const disconnectWallet = createAsyncThunk<void, void, { rejectValue: string }>(
  "web3/disconnect",
  async (_, { rejectWithValue }) => {
    try {
      await web3Service.disconnect();
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to disconnect");
    }
  }
);

export const refreshWalletBalance = createAsyncThunk<
  string | null,
  void,
  { rejectValue: string; state: { web3: Web3State } }
>("web3/refreshBalance", async (_, { getState, rejectWithValue }) => {
  const addr = getState().web3.walletInfo?.address;
  if (!addr) return null;
  try {
    const balance = await web3Service.getBalance(addr);
    return balance;
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : "Failed to refresh balance");
  }
});

const web3Slice = createSlice({
  name: "web3",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    syncFromService(state) {
      state.walletInfo = web3Service.getWalletInfo();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.walletInfo = action.payload;
        state.error = null;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(disconnectWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.loading = false;
        state.walletInfo = null;
        state.error = null;
      })
      .addCase(disconnectWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(refreshWalletBalance.fulfilled, (state, action) => {
        if (action.payload != null && state.walletInfo) {
          state.walletInfo = { ...state.walletInfo, balance: action.payload };
        }
      });
  },
});

export const { clearError, syncFromService } = web3Slice.actions;
export default web3Slice.reducer;
export type { Web3State };
