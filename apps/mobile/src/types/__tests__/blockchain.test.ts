import {
  BlockchainBalance,
  BlockchainBlock,
  BlockchainTransaction,
  BlockchainBlockWithTransactions,
  TransferRequest,
  SeedBalanceRequest,
  WalletInfo,
  Web3Config,
} from "@/src/types/blockchain";

// ============================================================
// Domain Test Values - 领域测试值
// ============================================================
const BLOCKCHAIN_DOMAIN = {
  CURRENCIES: ["ETH", "BTC", "MATIC", "BNB", "USD", "USDC"] as const,
  CHAINS: [
    { id: 1, name: "Ethereum Mainnet" },
    { id: 11155111, name: "Sepolia Testnet" },
    { id: 137, name: "Polygon Mainnet" },
    { id: 56, name: "BSC Mainnet" },
  ] as const,
  ACCOUNT_IDS: {
    SENDER: "ACC_SENDER_001",
    RECEIVER: "ACC_RECEIVER_002",
    TEST: "ACC_TEST_999",
  } as const,
  TIMESTAMPS: {
    NOW: "2024-01-15T10:30:00Z",
    PAST: "2024-01-01T00:00:00Z",
    FUTURE: "2024-12-31T23:59:59Z",
  } as const,
  AMOUNTS: {
    ZERO: 0,
    SMALL: 0.0001,
    TYPICAL: 1.5,
    LARGE: 10000,
  } as const,
} as const;

const BOUNDARY = {
  EMPTY_ARRAY: [] as string[],
  SINGLE_TX: ["tx1"] as string[],
  MULTIPLE_TX: ["tx1", "tx2", "tx3"] as string[],
} as const;

// ============================================================
// Factory Functions - 工厂函数
// ============================================================
const createBlockchainBalance = (overrides: Partial<BlockchainBalance> = {}): BlockchainBalance => ({
  account_id: BLOCKCHAIN_DOMAIN.ACCOUNT_IDS.TEST,
  currency: "ETH",
  balance: BLOCKCHAIN_DOMAIN.AMOUNTS.TYPICAL,
  ...overrides,
});

const createBlockchainBlock = (overrides: Partial<BlockchainBlock> = {}): BlockchainBlock => ({
  index: 12345678,
  timestamp: BLOCKCHAIN_DOMAIN.TIMESTAMPS.NOW,
  previous_hash: "0xabcdef1234567890",
  transaction_ids: ["tx1", "tx2"],
  hash: "0x1234567890abcdef",
  ...overrides,
});

const createBlockchainTransaction = (
  overrides: Partial<BlockchainTransaction> = {}
): BlockchainTransaction => ({
  tx_id: "0xtx123",
  block_index: 12345678,
  sender_account_id: BLOCKCHAIN_DOMAIN.ACCOUNT_IDS.SENDER,
  receiver_account_id: BLOCKCHAIN_DOMAIN.ACCOUNT_IDS.RECEIVER,
  amount: BLOCKCHAIN_DOMAIN.AMOUNTS.TYPICAL,
  currency: "ETH",
  created_at: BLOCKCHAIN_DOMAIN.TIMESTAMPS.NOW,
  ...overrides,
});

const createBlockWithTransactions = (
  overrides: Partial<BlockchainBlockWithTransactions> = {}
): BlockchainBlockWithTransactions => ({
  ...createBlockchainBlock(overrides),
  transactions: [createBlockchainTransaction()],
  ...overrides,
});

const createTransferRequest = (overrides: Partial<TransferRequest> = {}): TransferRequest => ({
  sender_account_id: BLOCKCHAIN_DOMAIN.ACCOUNT_IDS.SENDER,
  receiver_account_id: BLOCKCHAIN_DOMAIN.ACCOUNT_IDS.RECEIVER,
  amount: BLOCKCHAIN_DOMAIN.AMOUNTS.TYPICAL,
  currency: "ETH",
  ...overrides,
});

const createSeedBalanceRequest = (
  overrides: Partial<SeedBalanceRequest> = {}
): SeedBalanceRequest => ({
  account_id: BLOCKCHAIN_DOMAIN.ACCOUNT_IDS.TEST,
  currency: "ETH",
  amount: BLOCKCHAIN_DOMAIN.AMOUNTS.LARGE,
  ...overrides,
});

const createWalletInfo = (overrides: Partial<WalletInfo> = {}): WalletInfo => ({
  address: "0x1234567890abcdef",
  isConnected: true,
  ...overrides,
});

const createWeb3Config = (overrides: Partial<Web3Config> = {}): Web3Config => ({
  rpcUrl: "https://mainnet.infura.io/v3/your-project-id",
  chainId: 1,
  chainName: "Ethereum Mainnet",
  ...overrides,
});

// ============================================================
// Test Suites
// ============================================================
describe("Blockchain Entities", () => {
  describe("BlockchainBalance interface", () => {
    it.each([
      { desc: "typical balance", balance: 1.5, currency: "ETH" },
      { desc: "zero balance", balance: 0, currency: "BTC" },
      { desc: "small amount", balance: 0.0001, currency: "ETH" },
      { desc: "large amount", balance: 10000, currency: "USDC" },
    ])("should accept $desc", ({ balance, currency }) => {
      // Arrange
      const balanceData = createBlockchainBalance({ balance, currency });

      // Assert
      expect(balanceData.balance).toBe(balance);
      expect(balanceData.currency).toBe(currency);
      expect(balanceData.account_id).toBeDefined();
    });

    it.each(BLOCKCHAIN_DOMAIN.CURRENCIES)(
      "should accept currency %s",
      (currency) => {
        const balance = createBlockchainBalance({ currency });
        expect(balance.currency).toBe(currency);
      }
    );
  });

  describe("BlockchainBlock interface", () => {
    it("should accept valid block data", () => {
      // Arrange
      const block = createBlockchainBlock();

      // Assert
      expect(block.index).toBeDefined();
      expect(block.transaction_ids).toBeInstanceOf(Array);
      expect(block.hash).toBeDefined();
      expect(block.previous_hash).toBeDefined();
    });

    it.each([
      { desc: "empty", ids: [] },
      { desc: "single transaction", ids: ["tx1"] },
      { desc: "multiple transactions", ids: ["tx1", "tx2", "tx3"] },
    ])("should handle $desc transaction list", ({ ids }) => {
      const block = createBlockchainBlock({ transaction_ids: ids });
      expect(block.transaction_ids).toHaveLength(ids.length);
    });

    it("should accept various block indices", () => {
      const indices = [0, 1, 12345678, Number.MAX_SAFE_INTEGER];
      indices.forEach((index) => {
        const block = createBlockchainBlock({ index });
        expect(block.index).toBe(index);
      });
    });
  });

  describe("BlockchainTransaction interface", () => {
    it.each([
      { amount: 0.0001, desc: "small wei amount" },
      { amount: 1.5, desc: "typical ETH amount" },
      { amount: 1000, desc: "large amount" },
    ])("should accept $desc", ({ amount }) => {
      const tx = createBlockchainTransaction({ amount });
      expect(tx.amount).toBe(amount);
    });

    it("should link sender and receiver accounts", () => {
      const tx = createBlockchainTransaction();
      expect(tx.sender_account_id).toBeTruthy();
      expect(tx.receiver_account_id).toBeTruthy();
      expect(tx.sender_account_id).not.toBe(tx.receiver_account_id);
    });

    it("should include timestamp", () => {
      const tx = createBlockchainTransaction();
      expect(new Date(tx.created_at)).toBeInstanceOf(Date);
    });
  });

  describe("BlockchainBlockWithTransactions interface", () => {
    it("should combine block with transactions array", () => {
      // Arrange
      const transactions = [
        createBlockchainTransaction({ tx_id: "tx1" }),
        createBlockchainTransaction({ tx_id: "tx2" }),
      ];
      const block = createBlockWithTransactions({ transactions });

      // Assert
      expect(block.index).toBeDefined();
      expect(block.transactions).toHaveLength(2);
      expect(block.transactions[0].tx_id).toBe("tx1");
    });

    it("should allow empty transactions array", () => {
      const block = createBlockWithTransactions({ transactions: [] });
      expect(block.transactions).toHaveLength(0);
    });
  });

  describe("TransferRequest interface", () => {
    it.each([
      { amount: 1.0, currency: "ETH" },
      { amount: 0, currency: "ETH" },
      { amount: 10000, currency: "USDC" },
    ])("should accept transfer of $amount $currency", ({ amount, currency }) => {
      const request = createTransferRequest({ amount, currency });
      expect(request.amount).toBe(amount);
      expect(request.currency).toBe(currency);
    });

    it("should allow same sender and receiver (self-transfer)", () => {
      const accountId = BLOCKCHAIN_DOMAIN.ACCOUNT_IDS.TEST;
      const request = createTransferRequest({
        sender_account_id: accountId,
        receiver_account_id: accountId,
      });
      expect(request.sender_account_id).toBe(request.receiver_account_id);
    });
  });

  describe("SeedBalanceRequest interface", () => {
    it("should accept valid seed balance request", () => {
      const request = createSeedBalanceRequest();
      expect(request.account_id).toBeDefined();
      expect(request.currency).toBeDefined();
      expect(typeof request.amount).toBe("number");
    });

    it.each([
      { amount: 0, desc: "zero amount" },
      { amount: 100, desc: "typical amount" },
      { amount: 10000, desc: "large amount" },
    ])("should accept $desc", ({ amount }) => {
      const request = createSeedBalanceRequest({ amount });
      expect(request.amount).toBe(amount);
    });
  });

  describe("WalletInfo interface", () => {
    it.each([
      { isConnected: true, desc: "connected wallet" },
      { isConnected: false, desc: "disconnected wallet" },
    ])("should allow $desc state", ({ isConnected }) => {
      const wallet = createWalletInfo({ isConnected });
      expect(wallet.isConnected).toBe(isConnected);
    });

    it("should include optional chain info when provided", () => {
      const chain = BLOCKCHAIN_DOMAIN.CHAINS[0];
      const wallet = createWalletInfo({
        chainId: chain.id,
        chainName: chain.name,
        balance: "1.5",
      });

      expect(wallet.chainId).toBe(chain.id);
      expect(wallet.chainName).toBe(chain.name);
      expect(wallet.balance).toBe("1.5");
    });

    it("should omit optional fields when not provided", () => {
      const wallet = createWalletInfo({ isConnected: true });
      expect(wallet.chainId).toBeUndefined();
      expect(wallet.chainName).toBeUndefined();
      expect(wallet.balance).toBeUndefined();
    });
  });

  describe("Web3Config interface", () => {
    it.each(BLOCKCHAIN_DOMAIN.CHAINS)(
      "should accept chain $name (ID: $id)",
      ({ id, name }) => {
        const config = createWeb3Config({ chainId: id, chainName: name });
        expect(config.chainId).toBe(id);
        expect(config.chainName).toBe(name);
      }
    );

    it("should accept various RPC URLs", () => {
      const urls = [
        "https://mainnet.infura.io/v3/project-id",
        "https://sepolia.infura.io/v3/project-id",
        "https://polygon-rpc.com",
      ];

      urls.forEach((rpcUrl) => {
        const config = createWeb3Config({ rpcUrl });
        expect(config.rpcUrl).toBe(rpcUrl);
      });
    });
  });
});
