import { useState, useCallback } from "react";
import { blockchainApi } from "../api/blockchainApi";
import type {
  BlockchainBalance,
  BlockchainBlock,
  BlockchainBlockWithTransactions,
  BlockchainTransaction,
  TransferRequest,
} from "../types/blockchain";

export function useBlockchain() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBalance = useCallback(
    async (accountId: string, currency = "SIM_COIN"): Promise<BlockchainBalance | null> => {
      setLoading(true);
      setError(null);
      try {
        return await blockchainApi.getBalance(accountId, currency);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get balance";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getBlocks = useCallback(
    async (limit = 100, offset = 0): Promise<BlockchainBlock[]> => {
      setLoading(true);
      setError(null);
      try {
        return await blockchainApi.getBlocks(limit, offset);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get blocks";
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getBlock = useCallback(
    async (blockIndex: number): Promise<BlockchainBlockWithTransactions | null> => {
      setLoading(true);
      setError(null);
      try {
        return await blockchainApi.getBlock(blockIndex);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get block";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getTransaction = useCallback(
    async (txId: string): Promise<BlockchainTransaction | null> => {
      setLoading(true);
      setError(null);
      try {
        return await blockchainApi.getTransaction(txId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get transaction";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const submitTransfer = useCallback(
    async (request: TransferRequest): Promise<BlockchainTransaction | null> => {
      setLoading(true);
      setError(null);
      try {
        return await blockchainApi.submitTransfer(request);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit transfer";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
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
