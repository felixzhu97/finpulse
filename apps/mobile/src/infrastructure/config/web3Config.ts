import type { Web3Config } from "@/src/domain/entities/blockchain";

export const SEPOLIA_CHAIN_ID = 11155111;

export function getWeb3Config(): Web3Config {
  const rpcUrl = typeof process !== "undefined" && process.env?.EXPO_PUBLIC_ETH_RPC_URL;
  const chainIdRaw = typeof process !== "undefined" && process.env?.EXPO_PUBLIC_ETH_CHAIN_ID;
  const chainName = typeof process !== "undefined" && process.env?.EXPO_PUBLIC_ETH_CHAIN_NAME;
  if (typeof rpcUrl === "string" && rpcUrl && typeof chainIdRaw === "string" && chainIdRaw) {
    const chainId = parseInt(chainIdRaw, 10);
    if (Number.isFinite(chainId)) {
      return {
        rpcUrl: rpcUrl.replace(/\/$/, ""),
        chainId,
        chainName: typeof chainName === "string" && chainName ? chainName : "Ethereum",
      };
    }
  }
  return {
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    chainId: SEPOLIA_CHAIN_ID,
    chainName: "Sepolia",
  };
}
