import type {
  Account,
  AssetAllocationItem,
  Portfolio,
  PortfolioHistoryPoint,
  RiskSummary,
} from "../../domain/entities/portfolio";
import type { IPortfolioRepository } from "../../domain/repositories/IPortfolioRepository";
import { httpClient } from "../api/httpClient";

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
    const portfolio = await this.getPortfolio();
    if (!portfolio) return [];
    const grouped = new Map<Account["type"], number>();
    portfolio.accounts.forEach((account) => {
      const current = grouped.get(account.type) ?? 0;
      grouped.set(account.type, current + Math.max(account.balance, 0));
    });
    return Array.from(grouped.entries()).map(([type, value]) => ({
      type,
      value,
    }));
  }

  async getPortfolioHistory(): Promise<PortfolioHistoryPoint[]> {
    const portfolio = await this.getPortfolio();
    return portfolio?.history ?? [];
  }

  async getRiskSummary(): Promise<RiskSummary> {
    const portfolio = await this.getPortfolio();
    if (!portfolio) return { highRatio: 0, topHoldingsConcentration: 0 };
    const allHoldings = portfolio.accounts.flatMap((account) => account.holdings);
    const totalMarketValue = allHoldings.reduce(
      (sum, holding) => sum + holding.marketValue,
      0
    );
    const highRiskValue = allHoldings
      .filter((holding) => holding.riskLevel === "high")
      .reduce((sum, holding) => sum + holding.marketValue, 0);
    const sortedBySize = [...allHoldings].sort(
      (a, b) => b.marketValue - a.marketValue
    );
    const topFive = sortedBySize.slice(0, 5);
    const topFiveValue = topFive.reduce(
      (sum, holding) => sum + holding.marketValue,
      0
    );
    if (!totalMarketValue) {
      return { highRatio: 0, topHoldingsConcentration: 0 };
    }
    return {
      highRatio: highRiskValue / totalMarketValue,
      topHoldingsConcentration: topFiveValue / totalMarketValue,
    };
  }

  private async fetchFromApi(): Promise<Portfolio | null> {
    return httpClient.get<Portfolio>("/api/v1/portfolio");
  }
}
