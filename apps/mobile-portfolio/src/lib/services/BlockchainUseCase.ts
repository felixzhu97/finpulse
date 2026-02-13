import type {
  BlockchainBalance,
  BlockchainBlock,
  BlockchainBlockWithTransactions,
  BlockchainTransaction,
  TransferRequest,
} from "@/src/lib/types/blockchain";
import type { IBlockchainRepository } from "@/src/lib/types/IBlockchainRepository";

export class BlockchainUseCase {
  constructor(private blockchainRepository: IBlockchainRepository) {}

  async getBalance(
    accountId: string,
    currency = "SIM_COIN"
  ): Promise<BlockchainBalance | null> {
    return this.blockchainRepository.getBalance(accountId, currency);
  }

  async getBlocks(limit = 100, offset = 0): Promise<BlockchainBlock[]> {
    return this.blockchainRepository.getBlocks(limit, offset);
  }

  async getBlock(
    blockIndex: number
  ): Promise<BlockchainBlockWithTransactions | null> {
    return this.blockchainRepository.getBlock(blockIndex);
  }

  async getTransaction(txId: string): Promise<BlockchainTransaction | null> {
    return this.blockchainRepository.getTransaction(txId);
  }

  async submitTransfer(
    request: TransferRequest
  ): Promise<BlockchainTransaction | null> {
    return this.blockchainRepository.submitTransfer(request);
  }
}
