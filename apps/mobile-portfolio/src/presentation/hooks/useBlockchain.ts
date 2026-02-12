import { useState, useCallback } from "react";
import type {
  BlockchainBalance,
  BlockchainBlock,
  BlockchainBlockWithTransactions,
  BlockchainTransaction,
  TransferRequest,
} from "../../domain/entities/blockchain";
import { container } from "../../application/services/DependencyContainer";

export function useBlockchain() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blockchainRepository = container.getBlockchainRepository();

  const getBalance = useCallback(
    async (accountId: string, currency = "SIM_COIN"): Promise<BlockchainBalance | null> => {
      setLoading(true);
      setError(null);
      try {
        return await blockchainRepository.getBalance(accountId, currency);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get balance";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [blockchainRepository]
  );

  const getBlocks = useCallback(
    async (limit = 100, offset = 0): Promise<BlockchainBlock[]> => {
      setLoading(true);
      setError(null);
      try {
        return await blockchainRepository.getBlocks(limit, offset);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get blocks";
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [blockchainRepository]
  );

  const getBlock = useCallback(
    async (blockIndex: number): Promise<BlockchainBlockWithTransactions | null> => {
      setLoading(true);
      setError(null);
      try {
        return await blockchainRepository.getBlock(blockIndex);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get block";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [blockchainRepository]
  );

  const getTransaction = useCallback(
    async (txId: string): Promise<BlockchainTransaction | null> => {
      setLoading(true);
      setError(null);
      try {
        return await blockchainRepository.getTransaction(txId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get transaction";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [blockchainRepository]
  );

  const submitTransfer = useCallback(
    async (request: TransferRequest): Promise<BlockchainTransaction | null> => {
      setLoading(true);
      setError(null);
      try {
        return await blockchainRepository.submitTransfer(request);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit transfer";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [blockchainRepository]
  );

  return {
    loading,
    error,
    getBalance,
    getBlocks,
    getBlock,
    getTransaction,
    submitTransfer,
  };
}
