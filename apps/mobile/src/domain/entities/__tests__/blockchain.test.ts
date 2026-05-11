import {
  BlockchainBalance,
  BlockchainBlock,
  BlockchainTransaction,
  BlockchainBlockWithTransactions,
  TransferRequest,
  SeedBalanceRequest,
  WalletInfo,
  Web3Config,
} from "../../../domain/entities/blockchain";

describe("Blockchain Entities", () => {
  describe("BlockchainBalance interface", () => {
    it("should accept valid balance data", () => {
      const balance: BlockchainBalance = {
        account_id: "ACC001",
        currency: "ETH",
        balance: 1.5,
      };

      expect(balance.account_id).toBe("ACC001");
      expect(balance.currency).toBe("ETH");
      expect(balance.balance).toBe(1.5);
    });

    it("should handle zero balance", () => {
      const balance: BlockchainBalance = {
        account_id: "ACC002",
        currency: "BTC",
        balance: 0,
      };

      expect(balance.balance).toBe(0);
    });
  });

  describe("BlockchainBlock interface", () => {
    it("should accept valid block data", () => {
      const block: BlockchainBlock = {
        index: 12345678,
        timestamp: "2024-01-15T10:30:00Z",
        previous_hash: "0xabcdef1234567890",
        transaction_ids: ["tx1", "tx2", "tx3"],
        hash: "0x1234567890abcdef",
      };

      expect(block.index).toBe(12345678);
      expect(block.transaction_ids).toHaveLength(3);
      expect(block.hash).toBeDefined();
    });

    it("should handle empty transaction list", () => {
      const block: BlockchainBlock = {
        index: 1,
        timestamp: "2024-01-01T00:00:00Z",
        previous_hash: "0x0",
        transaction_ids: [],
        hash: "0x1",
      };

      expect(block.transaction_ids).toHaveLength(0);
    });
  });

  describe("BlockchainTransaction interface", () => {
    it("should accept valid transaction data", () => {
      const tx: BlockchainTransaction = {
        tx_id: "0xabc123",
        block_index: 12345678,
        sender_account_id: "ACC001",
        receiver_account_id: "ACC002",
        amount: 0.5,
        currency: "ETH",
        created_at: "2024-01-15T10:30:00Z",
      };

      expect(tx.tx_id).toBe("0xabc123");
      expect(tx.amount).toBe(0.5);
      expect(tx.currency).toBe("ETH");
    });

    it("should handle small amounts", () => {
      const tx: BlockchainTransaction = {
        tx_id: "0xsmall",
        block_index: 1,
        sender_account_id: "ACC001",
        receiver_account_id: "ACC002",
        amount: 0.0001,
        currency: "ETH",
        created_at: "2024-01-15T10:30:00Z",
      };

      expect(tx.amount).toBe(0.0001);
    });
  });

  describe("BlockchainBlockWithTransactions interface", () => {
    it("should combine block with transactions", () => {
      const block: BlockchainBlockWithTransactions = {
        index: 12345678,
        timestamp: "2024-01-15T10:30:00Z",
        previous_hash: "0xabcdef",
        transaction_ids: ["tx1", "tx2"],
        hash: "0x123456",
        transactions: [
          {
            tx_id: "tx1",
            block_index: 12345678,
            sender_account_id: "ACC001",
            receiver_account_id: "ACC002",
            amount: 0.5,
            currency: "ETH",
            created_at: "2024-01-15T10:30:00Z",
          },
        ],
      };

      expect(block.index).toBe(12345678);
      expect(block.transactions).toHaveLength(1);
    });
  });

  describe("TransferRequest interface", () => {
    it("should accept valid transfer request", () => {
      const request: TransferRequest = {
        sender_account_id: "ACC001",
        receiver_account_id: "ACC002",
        amount: 1.0,
        currency: "ETH",
      };

      expect(request.sender_account_id).toBe("ACC001");
      expect(request.receiver_account_id).toBe("ACC002");
      expect(request.amount).toBe(1.0);
      expect(request.currency).toBe("ETH");
    });

    it("should handle same sender and receiver for testing", () => {
      const request: TransferRequest = {
        sender_account_id: "ACC001",
        receiver_account_id: "ACC001",
        amount: 0,
        currency: "ETH",
      };

      expect(request.sender_account_id).toBe(request.receiver_account_id);
    });
  });

  describe("SeedBalanceRequest interface", () => {
    it("should accept valid seed balance request", () => {
      const request: SeedBalanceRequest = {
        account_id: "ACC001",
        currency: "ETH",
        amount: 100,
      };

      expect(request.account_id).toBe("ACC001");
      expect(request.currency).toBe("ETH");
      expect(request.amount).toBe(100);
    });

    it("should handle large amounts", () => {
      const request: SeedBalanceRequest = {
        account_id: "ACC001",
        currency: "ETH",
        amount: 10000,
      };

      expect(request.amount).toBe(10000);
    });
  });

  describe("WalletInfo interface", () => {
    it("should accept valid wallet info", () => {
      const wallet: WalletInfo = {
        address: "0x1234567890abcdef",
        isConnected: true,
        chainId: 1,
        chainName: "Ethereum Mainnet",
        balance: "1.5",
      };

      expect(wallet.address).toBe("0x1234567890abcdef");
      expect(wallet.isConnected).toBe(true);
      expect(wallet.chainId).toBe(1);
      expect(wallet.chainName).toBe("Ethereum Mainnet");
      expect(wallet.balance).toBe("1.5");
    });

    it("should allow disconnected wallet", () => {
      const wallet: WalletInfo = {
        address: "0x1234567890abcdef",
        isConnected: false,
      };

      expect(wallet.isConnected).toBe(false);
    });

    it("should allow optional chain info", () => {
      const wallet: WalletInfo = {
        address: "0x1234567890abcdef",
        isConnected: true,
      };

      expect(wallet.chainId).toBeUndefined();
      expect(wallet.chainName).toBeUndefined();
      expect(wallet.balance).toBeUndefined();
    });
  });

  describe("Web3Config interface", () => {
    it("should accept valid web3 config", () => {
      const config: Web3Config = {
        rpcUrl: "https://mainnet.infura.io/v3/your-project-id",
        chainId: 1,
        chainName: "Ethereum Mainnet",
      };

      expect(config.rpcUrl).toBe("https://mainnet.infura.io/v3/your-project-id");
      expect(config.chainId).toBe(1);
      expect(config.chainName).toBe("Ethereum Mainnet");
    });

    it("should accept testnet config", () => {
      const config: Web3Config = {
        rpcUrl: "https://sepolia.infura.io/v3/your-project-id",
        chainId: 11155111,
        chainName: "Sepolia Testnet",
      };

      expect(config.chainId).toBe(11155111);
    });
  });
});
