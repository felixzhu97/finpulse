/**
 * Auth Slice Tests - TDD Optimized
 * Following TDD Best Practices: AAA Pattern, Domain Values, Factory Functions, Boundary Testing
 */
import * as authSliceModule from "../../../presentation/store/authSlice";
import type { Customer } from "@/src/domain/entities/customer";

const {
  authSlice,
  setAuth,
  setCustomer,
  clearAuth,
  setRestored,
  getAuthStorageKey,
} = authSliceModule;

/**
 * Domain Test Values - Standardized test data for auth slice
 */
const DOMAIN_VALUES = {
  // Customer-related domain values
  CUSTOMER: {
    VALID: {
      id: "CUST001",
      name: "John Doe",
      email: "john@example.com",
      kyc_status: "verified",
      created_at: "2024-01-01T00:00:00Z",
    },
    EDGE_CASES: {
      MINIMAL: {
        customer_id: "C1",
        name: "A",
        email: null,
        kyc_status: null,
        created_at: "2024-01-01",
      },
      LONG_NAME: {
        customer_id: "CUST001",
        name: "A".repeat(100),
        email: "john@example.com",
        kyc_status: "verified",
        created_at: "2024-01-01T00:00:00Z",
      },
    },
  },
  // Token-related domain values
  TOKEN: {
    VALID: "test-token-123",
    LONG: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    EDGE_CASES: {
      SHORT: "a",
      EMPTY: "",
    },
  },
  // Auth storage key constant
  STORAGE_KEY: "@finpulse/auth_token",
} as const;

/**
 * Factory function for creating test Customer objects
 */
const createTestCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  customer_id: DOMAIN_VALUES.CUSTOMER.VALID.id,
  name: DOMAIN_VALUES.CUSTOMER.VALID.name,
  email: DOMAIN_VALUES.CUSTOMER.VALID.email,
  kyc_status: DOMAIN_VALUES.CUSTOMER.VALID.kyc_status,
  created_at: DOMAIN_VALUES.CUSTOMER.VALID.created_at,
  ...overrides,
});

/**
 * Factory function for creating test auth state
 */
const createAuthState = (overrides: {
  token?: string | null;
  customer?: Customer | null;
  restored?: boolean;
} = {}) => ({
  token: null,
  customer: null,
  restored: false,
  ...overrides,
});

describe("authSlice", () => {
  // Shared fixture - initial state
  let initialState: ReturnType<typeof authSlice.getInitialState>;

  beforeEach(() => {
    // Reset initial state for each test to ensure isolation
    initialState = authSlice.getInitialState();
  });

  describe("initial state", () => {
    it("should have null token", () => {
      expect(initialState.token).toBeNull();
    });

    it("should have null customer", () => {
      expect(initialState.customer).toBeNull();
    });

    it("should have restored as false", () => {
      expect(initialState.restored).toBe(false);
    });
  });

  describe("setAuth action", () => {
    describe("when setting authentication", () => {
      it("should set token and customer", () => {
        // Arrange
        const customer = createTestCustomer();

        // Act
        const action = setAuth({
          token: DOMAIN_VALUES.TOKEN.VALID,
          customer,
        });
        const state = authSlice.reducer(initialState, action);

        // Assert
        expect(state.token).toBe(DOMAIN_VALUES.TOKEN.VALID);
        expect(state.customer).toEqual(customer);
      });

      it("should set restored to true", () => {
        // Arrange
        const customer = createTestCustomer();

        // Act
        const action = setAuth({
          token: DOMAIN_VALUES.TOKEN.VALID,
          customer,
        });
        const state = authSlice.reducer(initialState, action);

        // Assert
        expect(state.restored).toBe(true);
      });
    });

    describe("when handling null customer", () => {
      it("should accept null customer", () => {
        // Act
        const action = setAuth({
          token: DOMAIN_VALUES.TOKEN.VALID,
          customer: null,
        });
        const state = authSlice.reducer(initialState, action);

        // Assert
        expect(state.token).toBe(DOMAIN_VALUES.TOKEN.VALID);
        expect(state.customer).toBeNull();
      });
    });

    describe("when updating existing auth state", () => {
      it("should update existing state", () => {
        // Arrange - first auth
        const firstCustomer = createTestCustomer();
        const stateWithAuth = authSlice.reducer(
          initialState,
          setAuth({ token: "old-token", customer: firstCustomer })
        );

        // Act - second auth with different data
        const secondCustomer = createTestCustomer({ name: "Jane Doe" });
        const action = setAuth({
          token: "new-token",
          customer: secondCustomer,
        });
        const state = authSlice.reducer(stateWithAuth, action);

        // Assert
        expect(state.token).toBe("new-token");
        expect(state.customer?.name).toBe("Jane Doe");
      });
    });

    describe("boundary value testing", () => {
      it("should handle long JWT tokens", () => {
        // Arrange
        const customer = createTestCustomer();

        // Act
        const action = setAuth({
          token: DOMAIN_VALUES.TOKEN.LONG,
          customer,
        });
        const state = authSlice.reducer(initialState, action);

        // Assert
        expect(state.token).toBe(DOMAIN_VALUES.TOKEN.LONG);
      });

      it("should handle minimal customer data", () => {
        // Arrange
        const minimalCustomer = createTestCustomer(
          DOMAIN_VALUES.CUSTOMER.EDGE_CASES.MINIMAL
        );

        // Act
        const action = setAuth({
          token: DOMAIN_VALUES.TOKEN.VALID,
          customer: minimalCustomer,
        });
        const state = authSlice.reducer(initialState, action);

        // Assert
        expect(state.customer).toEqual(minimalCustomer);
      });
    });
  });

  describe("setCustomer action", () => {
    describe("when setting customer", () => {
      it("should set customer", () => {
        // Arrange
        const customer = createTestCustomer();

        // Act
        const action = setCustomer(customer);
        const state = authSlice.reducer(initialState, action);

        // Assert
        expect(state.customer).toEqual(customer);
      });

      it("should not affect token", () => {
        // Arrange
        const stateWithToken = authSlice.reducer(
          initialState,
          setAuth({ token: DOMAIN_VALUES.TOKEN.VALID, customer: null })
        );
        const customer = createTestCustomer();

        // Act
        const action = setCustomer(customer);
        const state = authSlice.reducer(stateWithToken, action);

        // Assert
        expect(state.token).toBe(DOMAIN_VALUES.TOKEN.VALID);
        expect(state.customer).toEqual(customer);
      });
    });

    describe("when clearing customer", () => {
      it("should accept null customer", () => {
        // Arrange
        const stateWithCustomer = authSlice.reducer(
          initialState,
          setCustomer(createTestCustomer())
        );

        // Act
        const action = setCustomer(null);
        const state = authSlice.reducer(stateWithCustomer, action);

        // Assert
        expect(state.customer).toBeNull();
      });
    });

    describe("when updating customer details", () => {
      it("should update customer with new kyc_status", () => {
        // Arrange
        const originalCustomer = createTestCustomer();
        const stateWithCustomer = authSlice.reducer(
          initialState,
          setCustomer(originalCustomer)
        );

        // Act
        const updatedCustomer = createTestCustomer({ kyc_status: "pending" });
        const action = setCustomer(updatedCustomer);
        const state = authSlice.reducer(stateWithCustomer, action);

        // Assert
        expect(state.customer?.kyc_status).toBe("pending");
      });

      it("should update customer with new email", () => {
        // Arrange
        const originalCustomer = createTestCustomer();
        const stateWithCustomer = authSlice.reducer(
          initialState,
          setCustomer(originalCustomer)
        );

        // Act
        const updatedCustomer = createTestCustomer({
          email: "new-email@example.com",
        });
        const action = setCustomer(updatedCustomer);
        const state = authSlice.reducer(stateWithCustomer, action);

        // Assert
        expect(state.customer?.email).toBe("new-email@example.com");
      });
    });
  });

  describe("clearAuth action", () => {
    describe("when clearing authentication", () => {
      it("should clear token and customer", () => {
        // Arrange
        const stateWithAuth = authSlice.reducer(
          initialState,
          setAuth({
            token: DOMAIN_VALUES.TOKEN.VALID,
            customer: createTestCustomer(),
          })
        );

        // Act
        const action = clearAuth();
        const state = authSlice.reducer(stateWithAuth, action);

        // Assert
        expect(state.token).toBeNull();
        expect(state.customer).toBeNull();
      });

      it("should set restored to true", () => {
        // Act
        const action = clearAuth();
        const state = authSlice.reducer(initialState, action);

        // Assert
        expect(state.restored).toBe(true);
      });
    });

    describe("when clearing already cleared state", () => {
      it("should work on already cleared state", () => {
        // Act
        const action = clearAuth();
        const state = authSlice.reducer(initialState, action);

        // Assert
        expect(state.token).toBeNull();
        expect(state.customer).toBeNull();
        expect(state.restored).toBe(true);
      });
    });
  });

  describe("setRestored action", () => {
    describe("when setting restored flag", () => {
      it("should set restored to true", () => {
        // Act
        const action = setRestored(true);
        const state = authSlice.reducer(initialState, action);

        // Assert
        expect(state.restored).toBe(true);
      });

      it("should set restored to false", () => {
        // Arrange
        const stateWithRestored = authSlice.reducer(initialState, setRestored(true));

        // Act
        const action = setRestored(false);
        const state = authSlice.reducer(stateWithRestored, action);

        // Assert
        expect(state.restored).toBe(false);
      });

      it("should not affect token or customer", () => {
        // Arrange
        const stateWithAuth = authSlice.reducer(
          initialState,
          setAuth({
            token: DOMAIN_VALUES.TOKEN.VALID,
            customer: createTestCustomer(),
          })
        );

        // Act
        const action = setRestored(true);
        const state = authSlice.reducer(stateWithAuth, action);

        // Assert
        expect(state.token).toBe(DOMAIN_VALUES.TOKEN.VALID);
        expect(state.customer).toEqual(createTestCustomer());
        expect(state.restored).toBe(true);
      });
    });
  });

  describe("getAuthStorageKey", () => {
    it("should return correct storage key", () => {
      // Act
      const key = getAuthStorageKey();

      // Assert
      expect(key).toBe(DOMAIN_VALUES.STORAGE_KEY);
    });
  });

  describe("auth state transitions", () => {
    describe("login flow", () => {
      it("should model complete login flow", () => {
        // Arrange & Act & Assert - Initial state
        let state = initialState;
        expect(state.restored).toBe(false);
        expect(state.token).toBeNull();

        // After hydration
        state = authSlice.reducer(state, setRestored(true));
        expect(state.restored).toBe(true);

        // After successful login
        const customer = createTestCustomer();
        state = authSlice.reducer(
          state,
          setAuth({ token: "user-token", customer })
        );
        expect(state.token).toBe("user-token");
        expect(state.customer).toEqual(customer);

        // After logout
        state = authSlice.reducer(state, clearAuth());
        expect(state.token).toBeNull();
        expect(state.customer).toBeNull();
        expect(state.restored).toBe(true);
      });
    });

    describe("token refresh flow", () => {
      it("should model token refresh", () => {
        // Arrange
        const customer = createTestCustomer();
        let state = authSlice.reducer(
          initialState,
          setAuth({ token: "old-token", customer })
        );

        // Act - Refresh token
        state = authSlice.reducer(
          state,
          setAuth({ token: "new-token", customer })
        );

        // Assert
        expect(state.token).toBe("new-token");
        expect(state.customer).toEqual(customer);
      });
    });

    describe("customer update flow", () => {
      it("should model customer update without token change", () => {
        // Arrange
        const customer = createTestCustomer();
        let state = authSlice.reducer(
          initialState,
          setAuth({ token: "user-token", customer })
        );

        // Act - Update customer info
        const updatedCustomer = createTestCustomer({
          email: "new-email@example.com",
        });
        state = authSlice.reducer(state, setCustomer(updatedCustomer));

        // Assert
        expect(state.token).toBe("user-token");
        expect(state.customer?.email).toBe("new-email@example.com");
      });
    });
  });
});
