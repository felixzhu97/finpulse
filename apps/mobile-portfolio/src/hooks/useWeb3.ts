import { useState, useEffect, useCallback } from "react";
import { web3Service } from "../services/web3Service";
import type { WalletInfo, Web3Config } from "../types/blockchain";

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
    const web3Config = config ?? DEFAULT_CONFIG;
    if (!web3Service.isInitialized()) {
      web3Service.initialize(web3Config);
    }
    setWalletInfo(web3Service.getWalletInfo());
  }, [config]);

  const connect = useCallback(
    async (privateKey?: string) => {
      setLoading(true);
      setError(null);
      try {
        const info = await web3Service.connectWallet(privateKey);
        setWalletInfo(info);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to connect wallet";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const disconnect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await web3Service.disconnect();
      setWalletInfo(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to disconnect wallet";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!walletInfo?.address) return;

    setLoading(true);
    setError(null);
    try {
      const balance = await web3Service.getBalance(walletInfo.address);
      setWalletInfo((prev) =>
        prev ? { ...prev, balance } : null
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh balance";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [walletInfo?.address]);

  return {
    walletInfo,
    loading,
    error,
    connect,
    disconnect,
    refreshBalance,
    isConnected: web3Service.isConnected(),
  };
}
