import type {
  AssetAllocationItem,
  Portfolio,
  PortfolioHistoryPoint,
  RiskSummary,
} from "../../domain/entities/portfolio";
import { httpClient } from "../network/httpClient";

let portfolioCache: Portfolio | null = null;

export function invalidatePortfolioCache(): void {
  portfolioCache = null;
}

async function fetchPortfolio(): Promise<Portfolio | null> {
  if (portfolioCache) return portfolioCache;
  const fromApi = await httpClient.get<Portfolio>("/api/v1/portfolio");
  if (fromApi) {
    portfolioCache = fromApi;
    return fromApi;
  }
  return null;
}

export interface PortfolioDataResult {
  portfolio: Portfolio | null;
  allocation: AssetAllocationItem[];
  history: PortfolioHistoryPoint[];
}

export async function getPortfolioData(
  forceRefresh = false
): Promise<PortfolioDataResult> {
  if (forceRefresh) invalidatePortfolioCache();
  const [portfolio, allocation, history] = await Promise.all([
    fetchPortfolio(),
    httpClient.get<AssetAllocationItem[]>(
      "/api/v1/portfolio/asset-allocation-by-account-type"
    ).then((r: AssetAllocationItem[] | null) => r ?? []),
    fetchPortfolio().then((p) => p?.history ?? []),
  ]);
  return {
    portfolio: portfolio ?? null,
    allocation: allocation ?? [],
    history: history ?? [],
  };
}

export async function seedPortfolio(payload: unknown): Promise<boolean> {
  const result = await httpClient.post<{ ok: boolean }>("seed", payload);
  if (result?.ok) {
    invalidatePortfolioCache();
    return true;
  }
  return false;
}

export async function getRiskSummary(): Promise<RiskSummary> {
  const summary = await httpClient.get<RiskSummary>(
    "/api/v1/portfolio/risk-summary"
  );
  if (!summary) {
    return { highRatio: 0, topHoldingsConcentration: 0 };
  }
  return summary;
}
