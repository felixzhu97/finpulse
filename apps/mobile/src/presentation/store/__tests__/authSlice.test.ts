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

describe("authSlice", () => {
  const initialState = authSlice.getInitialState();
  const mockCustomer: Customer = {
    customer_id: "CUST001",
    name: "John Doe",
    email: "john@example.com",
    kyc_status: "verified",
    created_at: "2024-01-01T00:00:00Z",
  };

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
    it("should set token and customer", () => {
      const action = setAuth({
        token: "test-token-123",
        customer: mockCustomer,
      });
      const state = authSlice.reducer(initialState, action);

      expect(state.token).toBe("test-token-123");
      expect(state.customer).toEqual(mockCustomer);
    });

    it("should set restored to true", () => {
      const action = setAuth({
        token: "test-token-456",
        customer: null,
      });
      const state = authSlice.reducer(initialState, action);

      expect(state.restored).toBe(true);
    });

    it("should accept null customer", () => {
      const action = setAuth({
        token: "test-token-789",
        customer: null,
      });
      const state = authSlice.reducer(initialState, action);

      expect(state.token).toBe("test-token-789");
      expect(state.customer).toBeNull();
    });

    it("should update existing state", () => {
      const stateWithAuth = authSlice.reducer(
        initialState,
        setAuth({ token: "old-token", customer: mockCustomer })
      );

      const action = setAuth({
        token: "new-token",
        customer: { ...mockCustomer, name: "Jane Doe" },
      });
      const state = authSlice.reducer(stateWithAuth, action);

      expect(state.token).toBe("new-token");
      expect(state.customer?.name).toBe("Jane Doe");
    });

    it("should handle long tokens", () => {
      const longToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const action = setAuth({ token: longToken, customer: mockCustomer });
      const state = authSlice.reducer(initialState, action);

      expect(state.token).toBe(longToken);
    });
  });

  describe("setCustomer action", () => {
    it("should set customer", () => {
      const action = setCustomer(mockCustomer);
      const state = authSlice.reducer(initialState, action);

      expect(state.customer).toEqual(mockCustomer);
    });

    it("should accept null customer", () => {
      const stateWithCustomer = authSlice.reducer(initialState, setCustomer(mockCustomer));
      const action = setCustomer(null);
      const state = authSlice.reducer(stateWithCustomer, action);

      expect(state.customer).toBeNull();
    });

    it("should not affect token", () => {
      const stateWithToken = authSlice.reducer(
        initialState,
        setAuth({ token: "test-token", customer: null })
      );

      const action = setCustomer(mockCustomer);
      const state = authSlice.reducer(stateWithToken, action);

      expect(state.token).toBe("test-token");
      expect(state.customer).toEqual(mockCustomer);
    });

    it("should update customer details", () => {
      const stateWithCustomer = authSlice.reducer(initialState, setCustomer(mockCustomer));

      const updatedCustomer: Customer = {
        ...mockCustomer,
        kyc_status: "pending",
      };
      const action = setCustomer(updatedCustomer);
      const state = authSlice.reducer(stateWithCustomer, action);

      expect(state.customer?.kyc_status).toBe("pending");
    });
  });

  describe("clearAuth action", () => {
    it("should clear token", () => {
      const stateWithAuth = authSlice.reducer(
        initialState,
        setAuth({ token: "test-token", customer: mockCustomer })
      );

      const action = clearAuth();
      const state = authSlice.reducer(stateWithAuth, action);

      expect(state.token).toBeNull();
    });

    it("should clear customer", () => {
      const stateWithAuth = authSlice.reducer(
        initialState,
        setAuth({ token: "test-token", customer: mockCustomer })
      );

      const action = clearAuth();
      const state = authSlice.reducer(stateWithAuth, action);

      expect(state.customer).toBeNull();
    });

    it("should set restored to true", () => {
      const action = clearAuth();
      const state = authSlice.reducer(initialState, action);

      expect(state.restored).toBe(true);
    });

    it("should work on already cleared state", () => {
      const action = clearAuth();
      const state = authSlice.reducer(initialState, action);

      expect(state.token).toBeNull();
      expect(state.customer).toBeNull();
      expect(state.restored).toBe(true);
    });
  });

  describe("setRestored action", () => {
    it("should set restored to true", () => {
      const action = setRestored(true);
      const state = authSlice.reducer(initialState, action);

      expect(state.restored).toBe(true);
    });

    it("should set restored to false", () => {
      const stateWithRestored = authSlice.reducer(initialState, setRestored(true));

      const action = setRestored(false);
      const state = authSlice.reducer(stateWithRestored, action);

      expect(state.restored).toBe(false);
    });

    it("should not affect token or customer", () => {
      const stateWithAuth = authSlice.reducer(
        initialState,
        setAuth({ token: "test-token", customer: mockCustomer })
      );

      const action = setRestored(true);
      const state = authSlice.reducer(stateWithAuth, action);

      expect(state.token).toBe("test-token");
      expect(state.customer).toEqual(mockCustomer);
      expect(state.restored).toBe(true);
    });
  });

  describe("getAuthStorageKey", () => {
    it("should return correct storage key", () => {
      const key = getAuthStorageKey();
      expect(key).toBe("@finpulse/auth_token");
    });

    it("should return a string", () => {
      const key = getAuthStorageKey();
      expect(typeof key).toBe("string");
    });
  });

  describe("auth state transitions", () => {
    it("should model login flow", () => {
      let state = initialState;

      // Initial state
      expect(state.restored).toBe(false);
      expect(state.token).toBeNull();

      // After hydration
      state = authSlice.reducer(state, setRestored(true));
      expect(state.restored).toBe(true);

      // After successful login
      state = authSlice.reducer(
        state,
        setAuth({ token: "user-token", customer: mockCustomer })
      );
      expect(state.token).toBe("user-token");
      expect(state.customer).toEqual(mockCustomer);

      // After logout
      state = authSlice.reducer(state, clearAuth());
      expect(state.token).toBeNull();
      expect(state.customer).toBeNull();
      expect(state.restored).toBe(true);
    });

    it("should model token refresh", () => {
      let state = authSlice.reducer(
        initialState,
        setAuth({ token: "old-token", customer: mockCustomer })
      );

      // Refresh token
      state = authSlice.reducer(
        state,
        setAuth({ token: "new-token", customer: mockCustomer })
      );

      expect(state.token).toBe("new-token");
      expect(state.customer).toEqual(mockCustomer);
    });

    it("should model customer update without token change", () => {
      let state = authSlice.reducer(
        initialState,
        setAuth({ token: "user-token", customer: mockCustomer })
      );

      // Update customer info
      const updatedCustomer: Customer = {
        ...mockCustomer,
        email: "new-email@example.com",
      };
      state = authSlice.reducer(state, setCustomer(updatedCustomer));

      expect(state.token).toBe("user-token");
      expect(state.customer?.email).toBe("new-email@example.com");
    });
  });
});
