import { GetPortfolioUseCase } from "../usecases/GetPortfolioUseCase";
import { GetCustomerUseCase } from "../usecases/GetCustomerUseCase";
import { GetQuotesUseCase } from "../usecases/GetQuotesUseCase";
import { PortfolioRepository } from "../../infrastructure/repositories/PortfolioRepository";
import { QuoteRepository } from "../../infrastructure/repositories/QuoteRepository";
import { CustomerRepository } from "../../infrastructure/repositories/CustomerRepository";
import { UserPreferenceRepository } from "../../infrastructure/repositories/UserPreferenceRepository";
import { WatchlistRepository } from "../../infrastructure/repositories/WatchlistRepository";
import { InstrumentRepository } from "../../infrastructure/repositories/InstrumentRepository";
import { RiskMetricsRepository } from "../../infrastructure/repositories/RiskMetricsRepository";
import { PaymentRepository } from "../../infrastructure/repositories/PaymentRepository";
import { TradeRepository } from "../../infrastructure/repositories/TradeRepository";
import { OrderRepository } from "../../infrastructure/repositories/OrderRepository";
import { BlockchainRepository } from "../../infrastructure/repositories/BlockchainRepository";

class DependencyContainer {
  private portfolioRepository = new PortfolioRepository();
  private quoteRepository = new QuoteRepository();
  private customerRepository = new CustomerRepository();
  private userPreferenceRepository = new UserPreferenceRepository();
  private watchlistRepository = new WatchlistRepository();
  private instrumentRepository = new InstrumentRepository();
  private riskMetricsRepository = new RiskMetricsRepository();
  private paymentRepository = new PaymentRepository();
  private tradeRepository = new TradeRepository();
  private orderRepository = new OrderRepository();
  private blockchainRepository = new BlockchainRepository();

  getPortfolioUseCase(): GetPortfolioUseCase {
    return new GetPortfolioUseCase(this.portfolioRepository);
  }

  getCustomerUseCase(): GetCustomerUseCase {
    return new GetCustomerUseCase(this.customerRepository);
  }

  getQuotesUseCase(): GetQuotesUseCase {
    return new GetQuotesUseCase(this.quoteRepository);
  }

  getQuoteRepository(): QuoteRepository {
    return this.quoteRepository;
  }

  getPortfolioRepository(): PortfolioRepository {
    return this.portfolioRepository;
  }

  getCustomerRepository(): CustomerRepository {
    return this.customerRepository;
  }

  getUserPreferenceRepository(): UserPreferenceRepository {
    return this.userPreferenceRepository;
  }

  getWatchlistRepository(): WatchlistRepository {
    return this.watchlistRepository;
  }

  getInstrumentRepository(): InstrumentRepository {
    return this.instrumentRepository;
  }

  getRiskMetricsRepository(): RiskMetricsRepository {
    return this.riskMetricsRepository;
  }

  getPaymentRepository(): PaymentRepository {
    return this.paymentRepository;
  }

  getTradeRepository(): TradeRepository {
    return this.tradeRepository;
  }

  getOrderRepository(): OrderRepository {
    return this.orderRepository;
  }

  getBlockchainRepository(): BlockchainRepository {
    return this.blockchainRepository;
  }

  getAccountsApi() {
    const { accountsApi } = require("../../infrastructure/api/accountsApi");
    return accountsApi;
  }
}

export const container = new DependencyContainer();
