import type {
  BlockchainBalance,
  BlockchainBlock,
  BlockchainBlockWithTransactions,
  BlockchainTransaction,
  TransferRequest,
  SeedBalanceRequest,
} from "../entities/blockchain";

export interface IBlockchainRepository {
  getBlocks(limit?: number, offset?: number): Promise<BlockchainBlock[]>;
  getBlock(blockIndex: number): Promise<BlockchainBlockWithTransactions | null>;
  getTransaction(txId: string): Promise<BlockchainTransaction | null>;
  getBalance(accountId: string, currency?: string): Promise<BlockchainBalance | null>;
  submitTransfer(request: TransferRequest): Promise<BlockchainTransaction | null>;
  seedBalance(request: SeedBalanceRequest): Promise<BlockchainBalance | null>;
}
