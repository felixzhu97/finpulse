import type {
  Account,
  Holding,
  Portfolio,
  PortfolioHistoryPoint,
} from "../types/portfolio";
import { getPortfolioApiBaseUrl } from "../config/api";

export type PortfolioApiBaseUrlGetter = () => string;

export class PortfolioService {
  private cache: Portfolio | null = null;

  constructor(private readonly getBaseUrl: PortfolioApiBaseUrlGetter) {}

  invalidateCache(): void {
    this.cache = null;
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

  async getHoldingsByAccount(id: string): Promise<Holding[]> {
    const account = await this.getAccountById(id);
    return account?.holdings ?? [];
  }

  async getAssetAllocationByAccountType(): Promise<
    { type: Account["type"]; value: number }[]
  > {
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

  async getRiskSummary(): Promise<{
    highRatio: number;
    topHoldingsConcentration: number;
  }> {
    const portfolio = await this.getPortfolio();
    if (!portfolio) return { highRatio: 0, topHoldingsConcentration: 0 };
    const allHoldings: Holding[] = portfolio.accounts.flatMap(
      (account) => account.holdings,
    );
    const totalMarketValue = allHoldings.reduce(
      (sum, holding) => sum + holding.marketValue,
      0,
    );
    const highRiskValue = allHoldings
      .filter((holding) => holding.riskLevel === "high")
      .reduce((sum, holding) => sum + holding.marketValue, 0);
    const sortedBySize = [...allHoldings].sort(
      (a, b) => b.marketValue - a.marketValue,
    );
    const topFive = sortedBySize.slice(0, 5);
    const topFiveValue = topFive.reduce(
      (sum, holding) => sum + holding.marketValue,
      0,
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
    const base = this.getBaseUrl();
    const url = `${base}/api/v1/portfolio`;
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = (await response.json()) as Portfolio;
      return data;
    } catch {
      return null;
    }
  }
}

const defaultInstance = new PortfolioService(getPortfolioApiBaseUrl);

export function invalidatePortfolioCache(): void {
  defaultInstance.invalidateCache();
}

export async function getPortfolio(): Promise<Portfolio | null> {
  return defaultInstance.getPortfolio();
}

export async function getAccounts(): Promise<Account[]> {
  return defaultInstance.getAccounts();
}

export async function getAccountById(id: string): Promise<Account | undefined> {
  return defaultInstance.getAccountById(id);
}

export async function getHoldingsByAccount(id: string): Promise<Holding[]> {
  return defaultInstance.getHoldingsByAccount(id);
}

export async function getAssetAllocationByAccountType(): Promise<
  { type: Account["type"]; value: number }[]
> {
  return defaultInstance.getAssetAllocationByAccountType();
}

export async function getPortfolioHistory(): Promise<PortfolioHistoryPoint[]> {
  return defaultInstance.getPortfolioHistory();
}

export async function getRiskSummary(): Promise<{
  highRatio: number;
  topHoldingsConcentration: number;
}> {
  return defaultInstance.getRiskSummary();
}

export { defaultInstance as portfolioService };
