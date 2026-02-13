import type {
  Account,
  AssetAllocationItem,
  Portfolio,
  PortfolioHistoryPoint,
  RiskSummary,
} from "@/src/core/domain/entities/portfolio";
import type { IPortfolioRepository } from "@/src/core/domain/repositories/IPortfolioRepository";
import { httpClient } from "@/src/infrastructure/network/httpClient";

export class PortfolioRepository implements IPortfolioRepository {
  private cache: Portfolio | null = null;

  invalidateCache(): void {
    this.cache = null;
  }

  async seedPortfolio(payload: unknown): Promise<boolean> {
    const result = await httpClient.post<{ ok: boolean }>("seed", payload);
    if (result?.ok) {
      this.cache = null;
      return true;
    }
    return false;
  }

  async getPortfolio(): Promise<Portfolio | null> {
    if (this.cache) return this.cache;
    const fromApi = await this.fetchFromApi();
    if (fromApi) {
      this.cache = fromApi;
      return fromApi;
    }
    return null;
  }

  async getAccounts(): Promise<Account[]> {
    const portfolio = await this.getPortfolio();
    return portfolio?.accounts ?? [];
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    const portfolio = await this.getPortfolio();
    return portfolio?.accounts.find((account) => account.id === id);
  }

  async getHoldingsByAccount(accountId: string): Promise<Account["holdings"]> {
    const account = await this.getAccountById(accountId);
    return account?.holdings ?? [];
  }

  async getAssetAllocationByAccountType(): Promise<AssetAllocationItem[]> {
    const result = await httpClient.get<AssetAllocationItem[]>(
      "/api/v1/portfolio/asset-allocation-by-account-type"
    );
    return result ?? [];
  }

  async getPortfolioHistory(): Promise<PortfolioHistoryPoint[]> {
    const portfolio = await this.getPortfolio();
    return portfolio?.history ?? [];
  }

  async getRiskSummary(): Promise<RiskSummary> {
    const summary = await httpClient.get<RiskSummary>(
      "/api/v1/portfolio/risk-summary"
    );
    if (!summary) {
      return { highRatio: 0, topHoldingsConcentration: 0 };
    }
    return summary;
  }

  private async fetchFromApi(): Promise<Portfolio | null> {
    return httpClient.get<Portfolio>("/api/v1/portfolio");
  }
}
