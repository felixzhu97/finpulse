/**
 * Portfolio Slice Tests - TDD Optimized
 * Following TDD Best Practices: AAA Pattern, Domain Values, Boundary Testing
 */
import * as portfolioSliceModule from "../portfolioSlice";

const { portfolioSlice, setSelectedAccountId } = portfolioSliceModule;

/**
 * Domain Test Values - Standardized test data for portfolio slice
 */
const DOMAIN_VALUES = {
  ACCOUNT_IDS: {
    VALID: ["ACC001", "ACC_123", "brokerage-001", "account_with_underscores", "12345"],
    EDGE_CASES: {
      EMPTY_STRING: "",
      SINGLE_CHAR: "A",
      LONG_ID: "a".repeat(100),
      WITH_SPECIAL_CHARS: "acc@#$%",
    },
  },
} as const;

/**
 * Factory function for test state creation
 */
const createTestState = (overrides: { selectedAccountId?: string | null } = {}) => ({
  selectedAccountId: null,
  ...overrides,
});

describe("portfolioSlice", () => {
  // Shared fixture - initial state
  const initialState = createTestState();

  describe("initial state", () => {
    it("should have null selectedAccountId by default", () => {
      // Assert
      expect(initialState.selectedAccountId).toBeNull();
    });
  });

  describe("setSelectedAccountId action", () => {
    describe("when setting a valid account ID", () => {
      it("should set selected account ID", () => {
        // Arrange
        const accountId = "ACC001";

        // Act
        const action = setSelectedAccountId(accountId);
        const state = portfolioSlice.reducer(initialState, action);

        // Assert
        expect(state.selectedAccountId).toBe("ACC001");
      });
    });

    describe("when updating account selection", () => {
      it("should update selected account ID when changing selection", () => {
        // Arrange - first selection
        const firstAction = setSelectedAccountId("ACC001");
        const firstState = portfolioSlice.reducer(initialState, firstAction);

        // Act - second selection
        const secondAction = setSelectedAccountId("ACC002");
        const secondState = portfolioSlice.reducer(firstState, secondAction);

        // Assert
        expect(firstState.selectedAccountId).toBe("ACC001");
        expect(secondState.selectedAccountId).toBe("ACC002");
      });
    });

    describe("when clearing selection", () => {
      it("should allow setting to null to clear selection", () => {
        // Arrange
        const selectAction = setSelectedAccountId("ACC001");
        const stateWithSelection = portfolioSlice.reducer(initialState, selectAction);

        // Act
        const clearAction = setSelectedAccountId(null);
        const stateAfterClear = portfolioSlice.reducer(stateWithSelection, clearAction);

        // Assert
        expect(stateAfterClear.selectedAccountId).toBeNull();
      });
    });

    describe("boundary value testing", () => {
      // Standard account ID formats using domain values
      it.each(DOMAIN_VALUES.ACCOUNT_IDS.VALID)(
        "should handle valid account ID format: %s",
        (accountId) => {
          // Act
          const action = setSelectedAccountId(accountId);
          const state = portfolioSlice.reducer(initialState, action);

          // Assert
          expect(state.selectedAccountId).toBe(accountId);
        }
      );

      // Edge cases using parameterized tests
      it.each`
        desc                      | id
        ${"single character"}     | ${DOMAIN_VALUES.ACCOUNT_IDS.EDGE_CASES.SINGLE_CHAR}
        ${"long ID (100 chars)"} | ${DOMAIN_VALUES.ACCOUNT_IDS.EDGE_CASES.LONG_ID}
      `("should handle $desc account ID", ({ id }) => {
        // Act
        const action = setSelectedAccountId(id);
        const state = portfolioSlice.reducer(initialState, action);

        // Assert
        expect(state.selectedAccountId).toBe(id);
      });
    });
  });
});
