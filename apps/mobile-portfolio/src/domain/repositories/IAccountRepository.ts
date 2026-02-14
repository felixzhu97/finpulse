import type { AccountResource } from "../entities/accountResource";

export interface IAccountRepository {
  list(limit?: number, offset?: number): Promise<AccountResource[]>;
  getById(accountId: string): Promise<AccountResource | null>;
}
