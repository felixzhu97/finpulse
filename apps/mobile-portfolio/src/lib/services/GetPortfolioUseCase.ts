import type {
  AssetAllocationItem,
  Portfolio,
  PortfolioHistoryPoint,
} from "@/src/types/portfolio";
import type { IPortfolioRepository } from "@/src/types/IPortfolioRepository";

export class GetPortfolioUseCase {
  constructor(private portfolioRepository: IPortfolioRepository) {}

  async execute(): Promise<{
    portfolio: Portfolio | null;
    allocation: AssetAllocationItem[];
    history: PortfolioHistoryPoint[];
  }> {
    const [portfolio, allocation, history] = await Promise.all([
      this.portfolioRepository.getPortfolio(),
      this.portfolioRepository.getAssetAllocationByAccountType(),
      this.portfolioRepository.getPortfolioHistory(),
    ]);

    return {
      portfolio: portfolio ?? null,
      allocation,
      history: history ?? [],
    };
  }

  async refresh(): Promise<{
    portfolio: Portfolio | null;
    allocation: AssetAllocationItem[];
    history: PortfolioHistoryPoint[];
  }> {
    this.portfolioRepository.invalidateCache();
    return this.execute();
  }
}
