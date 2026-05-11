import * as portfolioSliceModule from "../../../presentation/store/portfolioSlice";

const { portfolioSlice, setSelectedAccountId } = portfolioSliceModule;

describe("portfolioSlice", () => {
  const initialState = portfolioSlice.getInitialState();

  describe("initial state", () => {
    it("should have null selectedAccountId by default", () => {
      expect(initialState.selectedAccountId).toBeNull();
    });
  });

  describe("setSelectedAccountId action", () => {
    it("should set selected account ID", () => {
      const action = setSelectedAccountId("ACC001");
      const state = portfolioSlice.reducer(initialState, action);

      expect(state.selectedAccountId).toBe("ACC001");
    });

    it("should update selected account ID when changing selection", () => {
      const firstAction = setSelectedAccountId("ACC001");
      const firstState = portfolioSlice.reducer(initialState, firstAction);

      const secondAction = setSelectedAccountId("ACC002");
      const secondState = portfolioSlice.reducer(firstState, secondAction);

      expect(firstState.selectedAccountId).toBe("ACC001");
      expect(secondState.selectedAccountId).toBe("ACC002");
    });

    it("should allow setting to null to clear selection", () => {
      const selectAction = setSelectedAccountId("ACC001");
      const stateWithSelection = portfolioSlice.reducer(initialState, selectAction);

      const clearAction = setSelectedAccountId(null);
      const stateAfterClear = portfolioSlice.reducer(stateWithSelection, clearAction);

      expect(stateAfterClear.selectedAccountId).toBeNull();
    });

    it("should handle string account IDs of various formats", () => {
      const accountIds = ["ACC_123", "brokerage-001", "account_with_underscores", "12345"];

      accountIds.forEach((accountId) => {
        const action = setSelectedAccountId(accountId);
        const state = portfolioSlice.reducer(initialState, action);
        expect(state.selectedAccountId).toBe(accountId);
      });
    });
  });
});
