import type { Account } from "@/src/lib/types/portfolio";
import type { AccountResource } from "@/src/lib/types/accountResource";
import type { Customer } from "@/src/lib/types/customer";
import type { IAccountRepository } from "@/src/lib/types/IAccountRepository";
import type { ICustomerRepository } from "@/src/lib/types/ICustomerRepository";
import type { IPortfolioRepository } from "@/src/lib/types/IPortfolioRepository";

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
