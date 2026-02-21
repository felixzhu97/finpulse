import { useState, useCallback, useEffect } from "react";
import type {
  BlockchainBalance,
  BlockchainBlock,
  BlockchainBlockWithTransactions,
  BlockchainTransaction,
  TransferRequest,
} from "../../domain/entities/blockchain";
import type { WalletInfo, Web3Config } from "../../domain/entities/blockchain";
import {
  getBlockchainBalance,
  getBlockchainBlocks,
  getBlockchainBlock,
  getBlockchainTransaction,
  submitTransfer,
} from "../../infrastructure/api";
import { web3Service } from "../../infrastructure/services";

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
        () => getBlockchainBalance(accountId, currency),
        null,
        "Failed to get balance"
      ),
    [run]
  );
  const getBlocks = useCallback(
    (limit = 100, offset = 0) =>
      run(
        () => getBlockchainBlocks(limit, offset),
        [],
        "Failed to get blocks"
      ),
    [run]
  );
  const getBlock = useCallback(
    (blockIndex: number) =>
      run(
        () => getBlockchainBlock(blockIndex),
        null,
        "Failed to get block"
      ),
    [run]
  );
  const getTransaction = useCallback(
    (txId: string) =>
      run(
        () => getBlockchainTransaction(txId),
        null,
        "Failed to get transaction"
      ),
    [run]
  );
  const submitTransferCallback = useCallback(
    (request: TransferRequest) =>
      run(
        () => submitTransfer(request),
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
    submitTransfer: submitTransferCallback,
  };
}

const DEFAULT_CONFIG: Web3Config = {
  rpcUrl: "https://eth.llamarpc.com",
  chainId: 1,
  chainName: "Ethereum Mainnet",
};

export function useWeb3(config?: Web3Config) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const service = web3Service;

  useEffect(() => {
    const web3Config = config ?? DEFAULT_CONFIG;
    if (!service.isInitialized()) {
      service.initialize(web3Config);
    }
    setWalletInfo(service.getWalletInfo());
  }, [config, service]);

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

  const connect = useCallback(
    async (privateKey?: string) => {
      const info = await run(
        () => service.connectWallet(privateKey),
        null,
        "Failed to connect wallet"
      );
      if (info) setWalletInfo(info);
    },
    [run, service]
  );

  const disconnect = useCallback(async () => {
    const ok = await run(
      async () => {
        await service.disconnect();
        return true;
      },
      false,
      "Failed to disconnect wallet"
    );
    if (ok) setWalletInfo(null);
  }, [run, service]);

  const refreshBalance = useCallback(async () => {
    if (!walletInfo?.address) return;
    const balance = await run(
      () => service.getBalance(walletInfo.address),
      null,
      "Failed to refresh balance"
    );
    if (balance != null) setWalletInfo((prev) => (prev ? { ...prev, balance } : null));
  }, [run, service, walletInfo?.address]);

  return {
    walletInfo,
    loading,
    error,
    connect,
    disconnect,
    refreshBalance,
    isConnected: service.isConnected(),
  };
}
