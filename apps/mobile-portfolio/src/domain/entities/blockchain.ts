export interface BlockchainBalance {
  account_id: string;
  currency: string;
  balance: number;
}

export interface BlockchainBlock {
  index: number;
  timestamp: string;
  previous_hash: string;
  transaction_ids: string[];
  hash: string;
}

export interface BlockchainTransaction {
  tx_id: string;
  block_index: number;
  sender_account_id: string;
  receiver_account_id: string;
  amount: number;
  currency: string;
  created_at: string;
}

export interface BlockchainBlockWithTransactions extends BlockchainBlock {
  transactions: BlockchainTransaction[];
}

export interface TransferRequest {
  sender_account_id: string;
  receiver_account_id: string;
  amount: number;
  currency: string;
}

export interface SeedBalanceRequest {
  account_id: string;
  currency: string;
  amount: number;
}

export interface WalletInfo {
  address: string;
  isConnected: boolean;
  chainId?: number;
  balance?: string;
}

export interface Web3Config {
  rpcUrl: string;
  chainId: number;
  chainName: string;
}
