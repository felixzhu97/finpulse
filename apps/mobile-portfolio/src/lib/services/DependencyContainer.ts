import type { IQuoteStreamService } from "./IQuoteStreamService";
import { GetPortfolioUseCase } from "./GetPortfolioUseCase";
import { GetQuotesUseCase } from "./GetQuotesUseCase";
import { RiskMetricsUseCase } from "./RiskMetricsUseCase";
import { TradeUseCase } from "./TradeUseCase";
import { WatchlistUseCase } from "./WatchlistUseCase";
import { UserPreferenceUseCase } from "./UserPreferenceUseCase";
import { GetAccountDataUseCase } from "./GetAccountDataUseCase";
import { RegisterCustomerUseCase } from "./RegisterCustomerUseCase";
import { PaymentUseCase } from "./PaymentUseCase";
import { BlockchainUseCase } from "./BlockchainUseCase";
import { PortfolioRepository } from "@/src/lib/api/endpoints/PortfolioRepository";
import { QuoteRepository } from "@/src/lib/api/endpoints/QuoteRepository";
import { CustomerRepository } from "@/src/lib/api/endpoints/CustomerRepository";
import { UserPreferenceRepository } from "@/src/lib/api/endpoints/UserPreferenceRepository";
import { WatchlistRepository } from "@/src/lib/api/endpoints/WatchlistRepository";
import { InstrumentRepository } from "@/src/lib/api/endpoints/InstrumentRepository";
import { RiskMetricsRepository } from "@/src/lib/api/endpoints/RiskMetricsRepository";
import { PaymentRepository } from "@/src/lib/api/endpoints/PaymentRepository";
import { TradeRepository } from "@/src/lib/api/endpoints/TradeRepository";
import { OrderRepository } from "@/src/lib/api/endpoints/OrderRepository";
import { BlockchainRepository } from "@/src/lib/api/endpoints/BlockchainRepository";
import { AccountRepository } from "@/src/lib/api/endpoints/AccountRepository";
import { QuoteStreamService } from "@/src/lib/services/QuoteStreamService";
import { web3Service } from "@/src/lib/services/web3Service";

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
