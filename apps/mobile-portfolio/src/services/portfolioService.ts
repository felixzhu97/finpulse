import type { Account, Holding, Portfolio } from "../types/portfolio";
import { demoPortfolio } from "../mocks/portfolioData";

export function getPortfolio(): Portfolio {
  return demoPortfolio;
}

export function getAccounts(): Account[] {
  return demoPortfolio.accounts;
}

export function getAccountById(id: string): Account | undefined {
  return demoPortfolio.accounts.find((account) => account.id === id);
}

export function getHoldingsByAccount(id: string): Holding[] {
  const account = getAccountById(id);
  return account?.holdings ?? [];
}

export function getAssetAllocationByAccountType(): {
  type: Account["type"];
  value: number;
}[] {
  const grouped = new Map<Account["type"], number>();

  demoPortfolio.accounts.forEach((account) => {
    const current = grouped.get(account.type) ?? 0;
    grouped.set(account.type, current + Math.max(account.balance, 0));
  });

  return Array.from(grouped.entries()).map(([type, value]) => ({
    type,
    value,
  }));
}

export function getRiskSummary(): {
  highRatio: number;
  topHoldingsConcentration: number;
} {
  const allHoldings: Holding[] = demoPortfolio.accounts.flatMap(
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

