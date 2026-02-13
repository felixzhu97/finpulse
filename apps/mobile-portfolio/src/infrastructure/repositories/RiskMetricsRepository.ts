import type { RiskMetrics } from "@/src/core/domain/entities/riskMetrics";
import type { VarComputeRequest, VarComputeResult } from "@/src/core/domain/entities/varCompute";
import type { IRiskMetricsRepository } from "@/src/core/domain/repositories/IRiskMetricsRepository";
import { httpClient } from "@/src/infrastructure/network/httpClient";

export class RiskMetricsRepository implements IRiskMetricsRepository {
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

  async computeVar(request: VarComputeRequest): Promise<VarComputeResult | null> {
    return httpClient.post<VarComputeResult>("/api/v1/risk-metrics/compute", {
      portfolio_id: request.portfolio_id,
      confidence: request.confidence ?? 0.95,
      method: request.method ?? "historical",
    });
  }
}
