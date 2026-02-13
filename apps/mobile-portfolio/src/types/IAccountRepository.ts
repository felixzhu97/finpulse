import type { AccountResource } from "@/src/types/accountResource";

export interface IAccountRepository {
  list(limit?: number, offset?: number): Promise<AccountResource[]>;
  getById(accountId: string): Promise<AccountResource | null>;
}
