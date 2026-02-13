import type { IAccountRepository } from "@/src/features/account/repositories/IAccountRepository";
import type { AccountResource } from "@/src/features/account/entities/accountResource";
import { accountsApi } from "../api/accountsApi";

export class AccountRepository implements IAccountRepository {
  async list(limit = 100, offset = 0): Promise<AccountResource[]> {
    return accountsApi.list(limit, offset);
  }

  async getById(accountId: string): Promise<AccountResource | null> {
    return accountsApi.getById(accountId);
  }
}
