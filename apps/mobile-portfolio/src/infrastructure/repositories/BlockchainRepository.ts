import type {
  BlockchainBalance,
  BlockchainBlock,
  BlockchainBlockWithTransactions,
  BlockchainTransaction,
  TransferRequest,
  SeedBalanceRequest,
} from "@/src/features/blockchain/entities/blockchain";
import type { IBlockchainRepository } from "@/src/features/blockchain/repositories/IBlockchainRepository";
import { httpClient } from "../api/httpClient";

export class BlockchainRepository implements IBlockchainRepository {
  async getBlocks(limit = 100, offset = 0): Promise<BlockchainBlock[]> {
    const result = await httpClient.get<BlockchainBlock[]>(
      `/api/v1/blockchain/blocks?limit=${limit}&offset=${offset}`
    );
    return result ?? [];
  }

  async getBlock(blockIndex: number): Promise<BlockchainBlockWithTransactions | null> {
    return httpClient.get<BlockchainBlockWithTransactions>(
      `/api/v1/blockchain/blocks/${blockIndex}`
    );
  }

  async getTransaction(txId: string): Promise<BlockchainTransaction | null> {
    return httpClient.get<BlockchainTransaction>(
      `/api/v1/blockchain/transactions/${txId}`
    );
  }

  async getBalance(
    accountId: string,
    currency = "SIM_COIN"
  ): Promise<BlockchainBalance | null> {
    const url = `/api/v1/blockchain/balances?account_id=${encodeURIComponent(accountId)}&currency=${encodeURIComponent(currency)}`;
    return httpClient.get<BlockchainBalance>(url);
  }

  async submitTransfer(request: TransferRequest): Promise<BlockchainTransaction | null> {
    return httpClient.post<BlockchainTransaction>(
      "/api/v1/blockchain/transfers",
      request
    );
  }

  async seedBalance(request: SeedBalanceRequest): Promise<BlockchainBalance | null> {
    return httpClient.post<BlockchainBalance>(
      "/api/v1/blockchain/seed-balance",
      request
    );
  }
}
