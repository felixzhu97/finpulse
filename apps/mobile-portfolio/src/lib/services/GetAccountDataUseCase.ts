import type { Account } from "@/src/types/portfolio";
import type { AccountResource } from "@/src/types/accountResource";
import type { Customer } from "@/src/types/customer";
import type { IAccountRepository } from "@/src/types/IAccountRepository";
import type { ICustomerRepository } from "@/src/types/ICustomerRepository";
import type { IPortfolioRepository } from "@/src/types/IPortfolioRepository";

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
