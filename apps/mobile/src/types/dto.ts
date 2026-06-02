import type { Account } from "@/src/types/portfolio";
import type { AccountResource } from "@/src/types/accountResource";
import type { Customer } from "@/src/types/customer";
import type { UserPreference } from "@/src/types/userPreference";
import type { Watchlist, WatchlistItem } from "@/src/types/watchlist";

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
