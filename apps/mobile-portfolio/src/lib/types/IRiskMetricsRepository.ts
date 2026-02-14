import type { RiskMetrics } from "@/src/lib/types/riskMetrics";
import type { VarComputeRequest, VarComputeResult } from "@/src/lib/types/varCompute";

export interface IRiskMetricsRepository {
  list(limit?: number, offset?: number): Promise<RiskMetrics[]>;
  getById(metricId: string): Promise<RiskMetrics | null>;
  findForPortfolio(metrics: RiskMetrics[], portfolioId: string): RiskMetrics | null;
  computeVar(request: VarComputeRequest): Promise<VarComputeResult | null>;
}
