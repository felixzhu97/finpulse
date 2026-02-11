import type { RiskMetrics } from "../types";
import { httpClient } from "./httpClient";

class RiskMetricsApi {
  async list(limit = 100, offset = 0): Promise<RiskMetrics[]> {
    return httpClient.getList<RiskMetrics>("risk-metrics", limit, offset);
  }

  async getById(metricId: string): Promise<RiskMetrics | null> {
    return httpClient.getById<RiskMetrics>("risk-metrics", metricId);
  }

  findForPortfolio(metrics: RiskMetrics[], portfolioId: string): RiskMetrics | null {
    const sorted = [...metrics].filter((m) => m.portfolio_id === portfolioId);
    if (sorted.length === 0) return null;
    sorted.sort(
      (a, b) => new Date(b.as_of_date).getTime() - new Date(a.as_of_date).getTime()
    );
    return sorted[0];
  }
}

export const riskMetricsApi = new RiskMetricsApi();
