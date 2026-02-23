import type { RiskMetrics } from "../../domain/entities/riskMetrics";
import type { VarComputeResult } from "../../domain/entities/varCompute";
import { httpClient } from "../network/httpClient";
import { getPortfolioData } from "./portfolio";

function findRiskMetricsForPortfolio(
  metrics: RiskMetrics[],
  portfolioId: string
): RiskMetrics | null {
  const filtered = metrics.filter((m) => m.portfolio_id === portfolioId);
  if (filtered.length === 0) return null;
  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(b.as_of_date).getTime() - new Date(a.as_of_date).getTime()
  );
  return sorted[0];
}

export async function getRiskMetrics(): Promise<RiskMetrics | null> {
  const [portfolioData, list] = await Promise.all([
    getPortfolioData(),
    httpClient.getList<RiskMetrics>("risk-metrics", 100, 0),
  ]);
  const portfolio = portfolioData.portfolio;
  if (list.length === 0) return null;
  const portfolioId = portfolio?.id ?? null;
  if (portfolioId) {
    const found = findRiskMetricsForPortfolio(list, portfolioId);
    if (found) return found;
  }
  return list[0];
}

export async function computeVar(): Promise<VarComputeResult | null> {
  const portfolioData = await getPortfolioData();
  const portfolioId = portfolioData.portfolio?.id;
  if (!portfolioId) return null;
  return httpClient.post<VarComputeResult>("/api/v1/risk-metrics/compute", {
    portfolio_id: portfolioId,
    confidence: 0.95,
    method: "historical",
  });
}
