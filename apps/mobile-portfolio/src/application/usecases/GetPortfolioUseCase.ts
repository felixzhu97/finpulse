import type {
  Account,
  AssetAllocationItem,
  Portfolio,
  PortfolioHistoryPoint,
} from "../../domain/entities/portfolio";
import type { IPortfolioRepository } from "../../domain/repositories/IPortfolioRepository";

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

  async getAccounts(): Promise<Account[]> {
    return this.portfolioRepository.getAccounts();
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    return this.portfolioRepository.getAccountById(id);
  }

  async refresh(): Promise<void> {
    this.portfolioRepository.invalidateCache();
    await this.execute();
  }
}
