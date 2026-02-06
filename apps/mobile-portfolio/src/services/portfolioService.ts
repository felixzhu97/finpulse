import type {
  Account,
  Holding,
  Portfolio,
  PortfolioHistoryPoint,
} from "../types/portfolio";
import { demoPortfolio } from "../mocks/portfolioData";

const API_BASE_URL = "http://localhost:8080/api/v1";

async function fetchPortfolio(): Promise<Portfolio | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio`);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as Portfolio;
    return data;
  } catch {
    return null;
  }
}

let cachedPortfolio: Portfolio | null = null;

export async function getPortfolio(): Promise<Portfolio> {
  if (cachedPortfolio) {
    return cachedPortfolio;
  }
  const fromApi = await fetchPortfolio();
  if (fromApi) {
    cachedPortfolio = fromApi;
    return fromApi;
  }
  cachedPortfolio = demoPortfolio;
  return demoPortfolio;
}

export async function getAccounts(): Promise<Account[]> {
  const portfolio = await getPortfolio();
  return portfolio.accounts;
}

export async function getAccountById(id: string): Promise<Account | undefined> {
  const portfolio = await getPortfolio();
  return portfolio.accounts.find((account) => account.id === id);
}

export async function getHoldingsByAccount(id: string): Promise<Holding[]> {
  const account = await getAccountById(id);
  return account?.holdings ?? [];
}

export async function getAssetAllocationByAccountType(): Promise<
  {
    type: Account["type"];
    value: number;
  }[]
> {
  const portfolio = await getPortfolio();
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

export async function getPortfolioHistory(): Promise<PortfolioHistoryPoint[]> {
  const portfolio = await getPortfolio();
  return portfolio.history;
}

export async function getRiskSummary(): Promise<{
  highRatio: number;
  topHoldingsConcentration: number;
}> {
  const portfolio = await getPortfolio();
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
    return {
      highRatio: 0,
      topHoldingsConcentration: 0,
    };
  }

  return {
    highRatio: highRiskValue / totalMarketValue,
    topHoldingsConcentration: topFiveValue / totalMarketValue,
  };
}

