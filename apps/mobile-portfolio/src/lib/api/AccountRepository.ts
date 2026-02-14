import type { IAccountRepository } from "@/src/types/IAccountRepository";
import type { AccountResource } from "@/src/types/accountResource";
import { httpClient } from "@/src/lib/network/httpClient";

export class AccountRepository implements IAccountRepository {
  async list(limit = 100, offset = 0): Promise<AccountResource[]> {
    return httpClient.getList<AccountResource>("accounts", limit, offset);
  }

  async getById(accountId: string): Promise<AccountResource | null> {
    return httpClient.getById<AccountResource>("accounts", accountId);
  }
}
