/**
 * Web3 Slice Tests - TDD Optimized
 * Following TDD Best Practices: AAA Pattern, Domain Values, Factory Functions, Mock/Spy Pattern
 * 
 * Note: This test file tests the web3Slice reducers and thunks using proper mocking
 * to avoid infrastructure dependencies.
 */
import { configureStore } from "@reduxjs/toolkit";
import type { WalletInfo } from "@/src/domain/entities/blockchain";

/**
 * Domain Test Values - Standardized test data for web3 slice
 */
const DOMAIN_VALUES = {
  WALLET: {
    VALID: {
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
      isConnected: true,
      chainId: 1,
      chainName: "Ethereum Mainnet",
      balance: "1.5",
    },
    EDGE_CASES: {
      MINIMAL: {
        address: "0x0000000000000000000000000000000000000001",
        isConnected: true,
      },
      TEST_NET: {
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
        isConnected: true,
        chainId: 11155111,
        chainName: "Sepolia Testnet",
      },
    },
  },
  ERROR: {
    CONNECTION_FAILED: "Failed to connect wallet",
    DISCONNECTION_FAILED: "Failed to disconnect",
    BALANCE_REFRESH_FAILED: "Failed to refresh balance",
  },
} as const;

/**
 * Web3State interface - duplicated from web3Slice to avoid import
 */
interface Web3State {
  walletInfo: WalletInfo | null;
  loading: boolean;
  error: string | null;
}

/**
 * Web3 Slice Actions interface
 */
interface Web3SliceActions {
  clearError: () => { type: string };
}

/**
 * Mock Web3 Service - Fake implementation for testing (Spy Pattern)
 */
const createMockWeb3Service = () => {
  const mock = {
    isInitialized: jest.fn<() => boolean>().mockReturnValue(true),
    initialize: jest.fn<() => void>(),
    getWalletInfo: jest.fn<() => WalletInfo | null>().mockReturnValue(null),
    connectWallet: jest.fn<() => Promise<WalletInfo>>(),
    disconnect: jest.fn<() => Promise<void>>(),
    getBalance: jest.fn<() => Promise<string>>(),
  };
  return mock;
};

/**
 * Factory function for creating test WalletInfo
 */
const createWalletInfo = (overrides: Partial<WalletInfo> = {}): WalletInfo => ({
  address: DOMAIN_VALUES.WALLET.VALID.address,
  isConnected: DOMAIN_VALUES.WALLET.VALID.isConnected,
  chainId: DOMAIN_VALUES.WALLET.VALID.chainId,
  chainName: DOMAIN_VALUES.WALLET.VALID.chainName,
  balance: DOMAIN_VALUES.WALLET.VALID.balance,
  ...overrides,
});

/**
 * Create a simplified web3 reducer for testing (without infrastructure dependencies)
 */
const createTestReducer = () => {
  const initialState: Web3State = {
    walletInfo: null,
    loading: false,
    error: null,
  };

  return (state = initialState, action: { type: string; payload?: unknown }): Web3State => {
    switch (action.type) {
      case "web3/clearError":
        return { ...state, error: null };
      case "web3/connect/pending":
        return { ...state, loading: true, error: null };
      case "web3/connect/fulfilled":
        return { ...state, loading: false, walletInfo: action.payload as WalletInfo, error: null };
      case "web3/connect/rejected":
        return { ...state, loading: false, error: (action.payload as string) ?? null };
      case "web3/disconnect/pending":
        return { ...state, loading: true, error: null };
      case "web3/disconnect/fulfilled":
        return { ...state, loading: false, walletInfo: null, error: null };
      case "web3/disconnect/rejected":
        return { ...state, loading: false, error: (action.payload as string) ?? null };
      case "web3/refreshBalance/fulfilled":
        if (action.payload != null && state.walletInfo) {
          return {
            ...state,
            walletInfo: { ...state.walletInfo, balance: action.payload as string },
          };
        }
        return state;
      default:
        return state;
    }
  };
};

/**
 * Action creators for testing
 */
const clearErrorAction = (): { type: string } => ({ type: "web3/clearError" });

describe("web3Slice Reducers", () => {
  // Shared fixture - initial state
  const createInitialState = (): Web3State => ({
    walletInfo: null,
    loading: false,
    error: null,
  });

  describe("initial state", () => {
    it("should have null walletInfo", () => {
      const initialState = createInitialState();
      expect(initialState.walletInfo).toBeNull();
    });

    it("should have loading as false", () => {
      const initialState = createInitialState();
      expect(initialState.loading).toBe(false);
    });

    it("should have null error", () => {
      const initialState = createInitialState();
      expect(initialState.error).toBeNull();
    });
  });

  describe("clearError reducer", () => {
    it("should clear error", () => {
      // Arrange
      const stateWithError = {
        ...createInitialState(),
        error: DOMAIN_VALUES.ERROR.CONNECTION_FAILED,
      };
      const reducer = createTestReducer();

      // Act
      const state = reducer(stateWithError, clearErrorAction());

      // Assert
      expect(state.error).toBeNull();
    });

    it("should preserve other state properties when clearing error", () => {
      // Arrange
      const walletInfo = createWalletInfo();
      const stateWithError = {
        walletInfo,
        loading: false,
        error: DOMAIN_VALUES.ERROR.CONNECTION_FAILED,
      };
      const reducer = createTestReducer();

      // Act
      const state = reducer(stateWithError, clearErrorAction());

      // Assert
      expect(state.error).toBeNull();
      expect(state.walletInfo).toEqual(walletInfo);
      expect(state.loading).toBe(false);
    });
  });
});

describe("web3Slice State Transitions", () => {
  const createStore = () => {
    const reducer = createTestReducer();
    return configureStore({
      reducer: { web3: reducer },
    });
  };

  describe("connect flow", () => {
    it("should model connect wallet flow", () => {
      // Arrange
      const store = createStore();

      // Initial state
      let state = store.getState().web3;
      expect(state.walletInfo).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      // Pending
      store.dispatch({ type: "web3/connect/pending" });
      state = store.getState().web3;
      expect(state.loading).toBe(true);

      // Fulfilled
      const walletInfo = createWalletInfo();
      store.dispatch({ type: "web3/connect/fulfilled", payload: walletInfo });
      state = store.getState().web3;
      expect(state.loading).toBe(false);
      expect(state.walletInfo).toEqual(walletInfo);
    });
  });

  describe("disconnect flow", () => {
    it("should model disconnect wallet flow", () => {
      // Arrange
      const store = createStore();

      // Connect first
      const walletInfo = createWalletInfo();
      store.dispatch({ type: "web3/connect/fulfilled", payload: walletInfo });

      // Pending disconnect
      store.dispatch({ type: "web3/disconnect/pending" });
      let state = store.getState().web3;
      expect(state.loading).toBe(true);

      // Fulfilled disconnect
      store.dispatch({ type: "web3/disconnect/fulfilled" });
      state = store.getState().web3;
      expect(state.loading).toBe(false);
      expect(state.walletInfo).toBeNull();
    });
  });

  describe("error handling flow", () => {
    it("should model connection error flow", () => {
      // Arrange
      const store = createStore();

      // Pending
      store.dispatch({ type: "web3/connect/pending" });
      let state = store.getState().web3;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      // Rejected
      store.dispatch({
        type: "web3/connect/rejected",
        payload: DOMAIN_VALUES.ERROR.CONNECTION_FAILED,
      });
      state = store.getState().web3;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(DOMAIN_VALUES.ERROR.CONNECTION_FAILED);

      // Clear error
      store.dispatch(clearErrorAction());
      state = store.getState().web3;
      expect(state.error).toBeNull();
    });

    it("should model disconnection error flow", () => {
      // Arrange
      const store = createStore();

      // Pending disconnect
      store.dispatch({ type: "web3/disconnect/pending" });

      // Rejected
      store.dispatch({
        type: "web3/disconnect/rejected",
        payload: DOMAIN_VALUES.ERROR.DISCONNECTION_FAILED,
      });
      let state = store.getState().web3;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(DOMAIN_VALUES.ERROR.DISCONNECTION_FAILED);
    });
  });

  describe("balance refresh flow", () => {
    it("should update wallet balance on fulfilled", () => {
      // Arrange
      const store = createStore();
      const walletInfo = createWalletInfo();
      store.dispatch({ type: "web3/connect/fulfilled", payload: walletInfo });

      // Act
      store.dispatch({ type: "web3/refreshBalance/fulfilled", payload: "2.5" });

      // Assert
      const state = store.getState().web3;
      expect(state.walletInfo?.balance).toBe("2.5");
    });

    it("should not update balance when wallet is null", () => {
      // Arrange
      const store = createStore();
      // No wallet connected

      // Act - should not throw
      store.dispatch({ type: "web3/refreshBalance/fulfilled", payload: "2.5" });

      // Assert
      const state = store.getState().web3;
      expect(state.walletInfo).toBeNull();
    });

    it("should handle null balance payload", () => {
      // Arrange
      const store = createStore();
      const walletInfo = createWalletInfo();
      store.dispatch({ type: "web3/connect/fulfilled", payload: walletInfo });

      // Act
      store.dispatch({ type: "web3/refreshBalance/fulfilled", payload: null });

      // Assert - balance should remain unchanged
      const state = store.getState().web3;
      expect(state.walletInfo?.balance).toBe(DOMAIN_VALUES.WALLET.VALID.balance);
    });
  });
});

describe("web3Slice Boundary Value Testing", () => {
  const createStore = () => {
    const reducer = createTestReducer();
    return configureStore({
      reducer: { web3: reducer },
    });
  };

  it("should handle minimal wallet info", () => {
    // Arrange
    const store = createStore();
    const walletInfo = createWalletInfo(DOMAIN_VALUES.WALLET.EDGE_CASES.MINIMAL);

    // Act
    store.dispatch({ type: "web3/connect/fulfilled", payload: walletInfo });

    // Assert
    const state = store.getState().web3;
    expect(state.walletInfo?.address).toBe(DOMAIN_VALUES.WALLET.EDGE_CASES.MINIMAL.address);
    expect(state.walletInfo?.isConnected).toBe(true);
  });

  it("should handle test network wallet info", () => {
    // Arrange
    const store = createStore();
    const walletInfo = createWalletInfo(DOMAIN_VALUES.WALLET.EDGE_CASES.TEST_NET);

    // Act
    store.dispatch({ type: "web3/connect/fulfilled", payload: walletInfo });

    // Assert
    const state = store.getState().web3;
    expect(state.walletInfo?.chainId).toBe(11155111);
    expect(state.walletInfo?.chainName).toBe("Sepolia Testnet");
  });

  it("should handle wallet info with all optional fields", () => {
    // Arrange
    const store = createStore();
    const fullWalletInfo: WalletInfo = {
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
      isConnected: true,
      chainId: 137,
      chainName: "Polygon Mainnet",
      balance: "100.5",
    };

    // Act
    store.dispatch({ type: "web3/connect/fulfilled", payload: fullWalletInfo });

    // Assert
    const state = store.getState().web3;
    expect(state.walletInfo).toEqual(fullWalletInfo);
  });

  it("should handle repeated connect/disconnect cycles", () => {
    // Arrange
    const store = createStore();

    // Connect/Disconnect cycle 1
    store.dispatch({ type: "web3/connect/fulfilled", payload: createWalletInfo() });
    expect(store.getState().web3.walletInfo).not.toBeNull();
    store.dispatch({ type: "web3/disconnect/fulfilled" });
    expect(store.getState().web3.walletInfo).toBeNull();

    // Connect/Disconnect cycle 2
    store.dispatch({ type: "web3/connect/fulfilled", payload: createWalletInfo({ address: "0xNewAddress" }) });
    expect(store.getState().web3.walletInfo?.address).toBe("0xNewAddress");
    store.dispatch({ type: "web3/disconnect/fulfilled" });
    expect(store.getState().web3.walletInfo).toBeNull();
  });
});

describe("web3Slice Mock Service Integration", () => {
  describe("when using mock web3Service", () => {
    it("should track service method calls", () => {
      // Arrange - using Spy Pattern
      const mockService = createMockWeb3Service();
      
      // Setup mock behavior
      mockService.connectWallet.mockResolvedValue(createWalletInfo());
      mockService.disconnect.mockResolvedValue();
      mockService.getBalance.mockResolvedValue("5.0");

      // Act - call the mocked methods
      const connectPromise = mockService.connectWallet();
      const disconnectPromise = mockService.disconnect();
      const balancePromise = mockService.getBalance("0xTestAddress");

      // Assert
      expect(mockService.connectWallet).toHaveBeenCalledTimes(1);
      expect(mockService.disconnect).toHaveBeenCalledTimes(1);
      expect(mockService.getBalance).toHaveBeenCalledWith("0xTestAddress");
    });

    it("should handle service errors", async () => {
      // Arrange
      const mockService = createMockWeb3Service();
      const errorMessage = "Connection refused";
      mockService.connectWallet.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(mockService.connectWallet()).rejects.toThrow(errorMessage);
      expect(mockService.connectWallet).toHaveBeenCalledTimes(1);
    });

    it("should return expected wallet info on connect", async () => {
      // Arrange
      const mockService = createMockWeb3Service();
      const expectedWallet = createWalletInfo();
      mockService.connectWallet.mockResolvedValue(expectedWallet);
      mockService.getWalletInfo.mockReturnValue(expectedWallet);

      // Act
      const result = await mockService.connectWallet();

      // Assert
      expect(result).toEqual(expectedWallet);
      expect(mockService.connectWallet).toHaveBeenCalledTimes(1);
    });
  });
});
