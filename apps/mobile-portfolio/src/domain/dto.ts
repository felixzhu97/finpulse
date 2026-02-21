import type { Account } from "./entities/portfolio";
import type { AccountResource } from "./entities/accountResource";
import type { Customer } from "./entities/customer";
import type { UserPreference } from "./entities/userPreference";
import type { Watchlist, WatchlistItem } from "./entities/watchlist";

export interface WatchlistWithItems {
  watchlist: Watchlist;
  items: WatchlistItem[];
}

export interface UpdatePreferenceInput {
  theme?: string | null;
  language?: string | null;
  notificationsEnabled?: boolean;
}

export interface AccountDataResult {
  customer: Customer | null;
  accounts: Account[];
  accountResources: AccountResource[];
}

export interface RegisterCustomerInput {
  name: string;
  email?: string;
}
