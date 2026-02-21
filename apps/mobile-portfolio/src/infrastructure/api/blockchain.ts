import type {
  BlockchainBalance,
  BlockchainBlock,
  BlockchainBlockWithTransactions,
  BlockchainTransaction,
  TransferRequest,
  SeedBalanceRequest,
} from "../../domain/entities/blockchain";
import { httpClient } from "../network/httpClient";

export async function getBlockchainBalance(
  accountId: string,
  currency = "SIM_COIN"
): Promise<BlockchainBalance | null> {
  const url = `/api/v1/blockchain/balances?account_id=${encodeURIComponent(accountId)}&currency=${encodeURIComponent(currency)}`;
  return httpClient.get<BlockchainBalance>(url);
}

export async function getBlockchainBlocks(
  limit = 100,
  offset = 0
): Promise<BlockchainBlock[]> {
  const result = await httpClient.get<BlockchainBlock[]>(
    `/api/v1/blockchain/blocks?limit=${limit}&offset=${offset}`
  );
  return result ?? [];
}

export async function getBlockchainBlock(
  blockIndex: number
): Promise<BlockchainBlockWithTransactions | null> {
  return httpClient.get<BlockchainBlockWithTransactions>(
    `/api/v1/blockchain/blocks/${blockIndex}`
  );
}

export async function getBlockchainTransaction(
  txId: string
): Promise<BlockchainTransaction | null> {
  return httpClient.get<BlockchainTransaction>(
    `/api/v1/blockchain/transactions/${txId}`
  );
}

export async function submitTransfer(
  request: TransferRequest
): Promise<BlockchainTransaction | null> {
  return httpClient.post<BlockchainTransaction>(
    "/api/v1/blockchain/transfers",
    request
  );
}

export async function seedBalance(
  request: SeedBalanceRequest
): Promise<BlockchainBalance | null> {
  return httpClient.post<BlockchainBalance>(
    "/api/v1/blockchain/seed-balance",
    request
  );
}
