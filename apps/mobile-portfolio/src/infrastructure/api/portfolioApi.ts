import { httpClient } from "./httpClient";
import type {
  AssetAllocationItem,
  Portfolio,
  RiskSummary,
} from "../../domain/entities/portfolio";

class PortfolioApi {
  async getPortfolio(): Promise<Portfolio | null> {
    return httpClient.get<Portfolio>("/api/v1/portfolio");
  }

  async getRiskSummary(): Promise<RiskSummary | null> {
    return httpClient.get<RiskSummary>("/api/v1/portfolio/risk-summary");
  }

  async getAssetAllocationByAccountType(): Promise<AssetAllocationItem[]> {
    const result = await httpClient.get<AssetAllocationItem[]>(
      "/api/v1/portfolio/asset-allocation-by-account-type"
    );
    return result ?? [];
  }
}

export const portfolioApi = new PortfolioApi();

