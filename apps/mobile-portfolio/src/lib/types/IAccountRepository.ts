import type { AccountResource } from "@/src/lib/types/accountResource";

export interface IAccountRepository {
  list(limit?: number, offset?: number): Promise<AccountResource[]>;
  getById(accountId: string): Promise<AccountResource | null>;
}
