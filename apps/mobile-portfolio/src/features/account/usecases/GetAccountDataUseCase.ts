import type { Account } from "@/src/features/portfolio/entities/portfolio";
import type { AccountResource } from "@/src/features/account/entities/accountResource";
import type { Customer } from "@/src/features/account/entities/customer";
import type { IAccountRepository } from "@/src/features/account/repositories/IAccountRepository";
import type { ICustomerRepository } from "@/src/features/account/repositories/ICustomerRepository";
import type { IPortfolioRepository } from "@/src/features/portfolio/repositories/IPortfolioRepository";

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
