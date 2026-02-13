import type {
  Account,
  AssetAllocationItem,
  Portfolio,
  PortfolioHistoryPoint,
  RiskSummary,
} from "@/src/types/portfolio";

export interface IPortfolioRepository {
  getPortfolio(): Promise<Portfolio | null>;
  getAccounts(): Promise<Account[]>;
  getAccountById(id: string): Promise<Account | undefined>;
  getHoldingsByAccount(accountId: string): Promise<Account["holdings"]>;
  getAssetAllocationByAccountType(): Promise<AssetAllocationItem[]>;
  getPortfolioHistory(): Promise<PortfolioHistoryPoint[]>;
  getRiskSummary(): Promise<RiskSummary>;
  seedPortfolio(payload: unknown): Promise<boolean>;
  invalidateCache(): void;
}
