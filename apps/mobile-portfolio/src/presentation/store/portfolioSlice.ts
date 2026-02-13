import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PortfolioState {
  selectedAccountId: string | null;
}

const initialState: PortfolioState = {
  selectedAccountId: null,
};

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    setSelectedAccountId(state, action: PayloadAction<string | null>) {
      state.selectedAccountId = action.payload;
    },
  },
});

export const { setSelectedAccountId } = portfolioSlice.actions;
export default portfolioSlice.reducer;
