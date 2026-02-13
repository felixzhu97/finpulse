import { httpClient } from "./httpClient";
import type { AccountResource } from "../../domain/entities/accountResource";

class AccountsApi {
  async list(limit = 100, offset = 0): Promise<AccountResource[]> {
    return httpClient.getList<AccountResource>("accounts", limit, offset);
  }

  async getById(accountId: string): Promise<AccountResource | null> {
    return httpClient.getById<AccountResource>("accounts", accountId);
  }
}

export const accountsApi = new AccountsApi();
export type { AccountResource };
