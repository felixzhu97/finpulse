import { useState, useEffect, useCallback } from "react";
import { container } from "../../application";
import type { WalletInfo, Web3Config } from "../../domain/entities/blockchain";
import { runWithLoading } from "./runWithLoading";

const DEFAULT_CONFIG: Web3Config = {
  rpcUrl: "https://eth.llamarpc.com",
  chainId: 1,
  chainName: "Ethereum Mainnet",
};

export function useWeb3(config?: Web3Config) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const service = container.getWeb3Service();
    const web3Config = config ?? DEFAULT_CONFIG;
    if (!service.isInitialized()) {
      service.initialize(web3Config);
    }
    setWalletInfo(service.getWalletInfo());
  }, [config]);

  const run = useCallback(
    <T>(fn: () => Promise<T>, fallback: T, msg: string) =>
      runWithLoading(setLoading, setError, fn, fallback, msg),
    []
  );

  const connect = useCallback(
    async (privateKey?: string) => {
      const info = await run(
        () => container.getWeb3Service().connectWallet(privateKey),
        null,
        "Failed to connect wallet"
      );
      if (info) setWalletInfo(info);
    },
    [run]
  );

  const disconnect = useCallback(async () => {
    const ok = await run(
      async () => {
        await container.getWeb3Service().disconnect();
        return true;
      },
      false,
      "Failed to disconnect wallet"
    );
    if (ok) setWalletInfo(null);
  }, [run]);

  const refreshBalance = useCallback(async () => {
    if (!walletInfo?.address) return;
    const balance = await run(
      () => container.getWeb3Service().getBalance(walletInfo.address),
      null,
      "Failed to refresh balance"
    );
    if (balance != null) setWalletInfo((prev) => (prev ? { ...prev, balance } : null));
  }, [run, walletInfo?.address]);

  return {
    walletInfo,
    loading,
    error,
    connect,
    disconnect,
    refreshBalance,
    isConnected: container.getWeb3Service().isConnected(),
  };
}
