import { ethers } from "ethers";
import type { WalletInfo, Web3Config } from "@/src/lib/types/blockchain";

class Web3Service {
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private walletInfo: WalletInfo | null = null;
  private config: Web3Config | null = null;

  initialize(config: Web3Config): void {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
  }

  async connectWallet(privateKey?: string): Promise<WalletInfo> {
    if (!this.provider) {
      throw new Error("Web3 service not initialized");
    }

    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    } else {
      this.signer = ethers.Wallet.createRandom().connect(this.provider);
    }

    const address = await this.signer.getAddress();
    const balance = await this.provider!.getBalance(address);
    const network = await this.provider.getNetwork();

    this.walletInfo = {
      address,
      isConnected: true,
      chainId: Number(network.chainId),
      balance: ethers.formatEther(balance),
    };

    return this.walletInfo;
  }

  async disconnect(): Promise<void> {
    this.signer = null;
    this.walletInfo = null;
  }

  getWalletInfo(): WalletInfo | null {
    return this.walletInfo;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error("Web3 service not initialized");
    }
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async sendTransaction(
    to: string,
    amount: string,
    currency = "ETH"
  ): Promise<ethers.TransactionResponse | null> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const value = ethers.parseEther(amount);
      const tx = await this.signer.sendTransaction({
        to,
        value,
      });
      return tx;
    } catch (error) {
      console.error("Transaction failed:", error);
      return null;
    }
  }

  async signMessage(message: string): Promise<string | null> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      return await this.signer.signMessage(message);
    } catch (error) {
      console.error("Message signing failed:", error);
      return null;
    }
  }

  isInitialized(): boolean {
    return this.provider !== null;
  }

  isConnected(): boolean {
    return this.walletInfo?.isConnected ?? false;
  }
}

export const web3Service = new Web3Service();
