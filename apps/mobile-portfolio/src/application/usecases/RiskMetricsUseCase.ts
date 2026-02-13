import type { RiskMetrics } from "../../domain/entities/riskMetrics";
import type { VarComputeResult } from "../../domain/entities/varCompute";
import type { IPortfolioRepository } from "../../domain/repositories/IPortfolioRepository";
import type { IRiskMetricsRepository } from "../../domain/repositories/IRiskMetricsRepository";

export class RiskMetricsUseCase {
  constructor(
    private portfolioRepository: IPortfolioRepository,
    private riskMetricsRepository: IRiskMetricsRepository
  ) {}

  async get(): Promise<RiskMetrics | null> {
    const [portfolio, list] = await Promise.all([
      this.portfolioRepository.getPortfolio(),
      this.riskMetricsRepository.list(),
    ]);

    if (list.length === 0) return null;

    const portfolioId = portfolio?.id ?? null;
    if (portfolioId) {
      const found = this.riskMetricsRepository.findForPortfolio(list, portfolioId);
      if (found) return found;
    }

    return list[0];
  }

  async getRiskSummary() {
    return this.portfolioRepository.getRiskSummary();
  }

  async computeVar(): Promise<VarComputeResult | null> {
    const portfolio = await this.portfolioRepository.getPortfolio();
    const portfolioId = portfolio?.id;
    if (!portfolioId) return null;

    return this.riskMetricsRepository.computeVar({
      portfolio_id: portfolioId,
      confidence: 0.95,
      method: "historical",
    });
  }
}
