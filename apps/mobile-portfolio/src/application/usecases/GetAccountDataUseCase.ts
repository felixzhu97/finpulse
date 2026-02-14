import type { Account } from "../../domain/entities/portfolio";
import type { AccountResource } from "../../domain/entities/accountResource";
import type { Customer } from "../../domain/entities/customer";
import type { IAccountRepository } from "../../domain/repositories/IAccountRepository";
import type { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import type { IPortfolioRepository } from "../../domain/repositories/IPortfolioRepository";

export interface AccountDataResult {
  customer: Customer | null;
  accounts: Account[];
  accountResources: AccountResource[];
}

export class GetAccountDataUseCase {
  constructor(
    private customerRepository: ICustomerRepository,
    private portfolioRepository: IPortfolioRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(): Promise<AccountDataResult> {
    const [customer, portfolio, accountResources] = await Promise.all([
      this.customerRepository.getFirst(),
      this.portfolioRepository.getPortfolio(),
      this.accountRepository.list(100, 0),
    ]);

    return {
      customer,
      accounts: portfolio?.accounts ?? [],
      accountResources: accountResources ?? [],
    };
  }
}
