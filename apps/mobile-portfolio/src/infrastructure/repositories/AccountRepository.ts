import type { IAccountRepository } from "../../domain/repositories/IAccountRepository";
import type { AccountResource } from "../../domain/entities/accountResource";
import { httpClient } from "@/src/infrastructure/network/httpClient";

export class AccountRepository implements IAccountRepository {
  async list(limit = 100, offset = 0): Promise<AccountResource[]> {
    return httpClient.getList<AccountResource>("accounts", limit, offset);
  }

  async getById(accountId: string): Promise<AccountResource | null> {
    return httpClient.getById<AccountResource>("accounts", accountId);
  }
}
