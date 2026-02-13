import { useState, useCallback } from "react";
import type {
  BlockchainBalance,
  BlockchainBlock,
  BlockchainBlockWithTransactions,
  BlockchainTransaction,
  TransferRequest,
} from "../../domain/entities/blockchain";
import { container } from "../../application";

export function useBlockchain() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T>(fn: () => Promise<T>, fallback: T, msg: string) => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : msg);
        return fallback;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getBalance = useCallback(
    (accountId: string, currency = "SIM_COIN") =>
      run(
        () => container.getBlockchainUseCase().getBalance(accountId, currency),
        null,
        "Failed to get balance"
      ),
    [run]
  );
  const getBlocks = useCallback(
    (limit = 100, offset = 0) =>
      run(
        () => container.getBlockchainUseCase().getBlocks(limit, offset),
        [],
        "Failed to get blocks"
      ),
    [run]
  );
  const getBlock = useCallback(
    (blockIndex: number) =>
      run(
        () => container.getBlockchainUseCase().getBlock(blockIndex),
        null,
        "Failed to get block"
      ),
    [run]
  );
  const getTransaction = useCallback(
    (txId: string) =>
      run(
        () => container.getBlockchainUseCase().getTransaction(txId),
        null,
        "Failed to get transaction"
      ),
    [run]
  );
  const submitTransfer = useCallback(
    (request: TransferRequest) =>
      run(
        () => container.getBlockchainUseCase().submitTransfer(request),
        null,
        "Failed to submit transfer"
      ),
    [run]
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
