import { httpClient } from "./httpClient";

export interface AccountResource {
  account_id: string;
  customer_id: string;
  account_type: string;
  currency: string;
  status: string;
  opened_at: string;
}

class AccountsApi {
  async list(limit = 100, offset = 0): Promise<AccountResource[]> {
    return httpClient.getList<AccountResource>("accounts", limit, offset);
  }

  async getById(accountId: string): Promise<AccountResource | null> {
    return httpClient.getById<AccountResource>("accounts", accountId);
  }
}

export const accountsApi = new AccountsApi();
