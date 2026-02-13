import type { IQuoteStreamService } from "../../domain/services/IQuoteStreamService";
import { GetPortfolioUseCase } from "../usecases/GetPortfolioUseCase";
import { GetQuotesUseCase } from "../usecases/GetQuotesUseCase";
import { RiskMetricsUseCase } from "../usecases/RiskMetricsUseCase";
import { TradeUseCase } from "../usecases/TradeUseCase";
import { WatchlistUseCase } from "../usecases/WatchlistUseCase";
import { UserPreferenceUseCase } from "../usecases/UserPreferenceUseCase";
import { GetAccountDataUseCase } from "../usecases/GetAccountDataUseCase";
import { RegisterCustomerUseCase } from "../usecases/RegisterCustomerUseCase";
import { PaymentUseCase } from "../usecases/PaymentUseCase";
import { BlockchainUseCase } from "../usecases/BlockchainUseCase";
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
import { AccountRepository } from "../../infrastructure/repositories/AccountRepository";
import { QuoteStreamService } from "../../infrastructure/services/QuoteStreamService";
import { web3Service } from "../../infrastructure/services/web3Service";

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
  private accountRepository = new AccountRepository();
  private quoteStreamService = new QuoteStreamService();

  getPortfolioUseCase(): GetPortfolioUseCase {
    return new GetPortfolioUseCase(this.portfolioRepository);
  }

  getQuotesUseCase(): GetQuotesUseCase {
    return new GetQuotesUseCase(this.quoteRepository);
  }

  getRiskMetricsUseCase(): RiskMetricsUseCase {
    return new RiskMetricsUseCase(
      this.portfolioRepository,
      this.riskMetricsRepository
    );
  }

  getWatchlistUseCase(): WatchlistUseCase {
    return new WatchlistUseCase(
      this.customerRepository,
      this.watchlistRepository,
      this.instrumentRepository
    );
  }

  getUserPreferenceUseCase(): UserPreferenceUseCase {
    return new UserPreferenceUseCase(
      this.customerRepository,
      this.userPreferenceRepository
    );
  }

  getAccountDataUseCase(): GetAccountDataUseCase {
    return new GetAccountDataUseCase(
      this.customerRepository,
      this.portfolioRepository,
      this.accountRepository
    );
  }

  getRegisterCustomerUseCase(): RegisterCustomerUseCase {
    return new RegisterCustomerUseCase(this.customerRepository);
  }

  getPaymentUseCase(): PaymentUseCase {
    return new PaymentUseCase(this.accountRepository, this.paymentRepository);
  }

  getTradeUseCase(): TradeUseCase {
    return new TradeUseCase(
      this.accountRepository,
      this.instrumentRepository,
      this.orderRepository,
      this.tradeRepository
    );
  }

  getBlockchainUseCase(): BlockchainUseCase {
    return new BlockchainUseCase(this.blockchainRepository);
  }

  getQuoteStreamService(): IQuoteStreamService {
    return this.quoteStreamService;
  }

  getWeb3Service() {
    return web3Service;
  }
}

export const container = new DependencyContainer();
