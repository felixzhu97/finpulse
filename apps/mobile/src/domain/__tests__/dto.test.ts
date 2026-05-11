import type { Account } from "../entities/portfolio";
import type { AccountResource } from "../entities/accountResource";
import type { Customer } from "../entities/customer";
import type { UserPreference } from "../entities/userPreference";
import type { Watchlist, WatchlistItem } from "../entities/watchlist";
import {
  WatchlistWithItems,
  UpdatePreferenceInput,
  AccountDataResult,
  RegisterCustomerInput,
} from "../dto";

describe("DTO Types", () => {
  describe("WatchlistWithItems", () => {
    it("should combine watchlist with its items", () => {
      const watchlist: Watchlist = {
        watchlist_id: "WL001",
        customer_id: "C001",
        name: "Tech Stocks",
        created_at: "2024-01-15T10:00:00Z",
      };

      const items: WatchlistItem[] = [
        {
          watchlist_item_id: "WI001",
          watchlist_id: "WL001",
          instrument_id: "INST_AAPL",
          added_at: "2024-01-15T11:00:00Z",
        },
        {
          watchlist_item_id: "WI002",
          watchlist_id: "WL001",
          instrument_id: "INST_GOOGL",
          added_at: "2024-01-15T11:30:00Z",
        },
      ];

      const watchlistWithItems: WatchlistWithItems = {
        watchlist,
        items,
      };

      expect(watchlistWithItems.watchlist.watchlist_id).toBe("WL001");
      expect(watchlistWithItems.items).toHaveLength(2);
    });
  });

  describe("UpdatePreferenceInput", () => {
    it("should accept partial preference update", () => {
      const update: UpdatePreferenceInput = {
        theme: "dark",
      };

      expect(update.theme).toBe("dark");
      expect(update.language).toBeUndefined();
      expect(update.notificationsEnabled).toBeUndefined();
    });

    it("should accept full preference update", () => {
      const update: UpdatePreferenceInput = {
        theme: "light",
        language: "zh-CN",
        notificationsEnabled: false,
      };

      expect(update.theme).toBe("light");
      expect(update.language).toBe("zh-CN");
      expect(update.notificationsEnabled).toBe(false);
    });

    it("should allow null for theme", () => {
      const update: UpdatePreferenceInput = {
        theme: null,
      };

      expect(update.theme).toBeNull();
    });

    it("should allow null for language", () => {
      const update: UpdatePreferenceInput = {
        language: null,
      };

      expect(update.language).toBeNull();
    });
  });

  describe("AccountDataResult", () => {
    it("should combine customer with accounts and resources", () => {
      const customer: Customer = {
        customer_id: "C001",
        name: "John Doe",
        email: "john@example.com",
        kyc_status: "verified",
        created_at: "2024-01-01T00:00:00Z",
      };

      const account: Account = {
        id: "ACC001",
        name: "Brokerage",
        type: "brokerage",
        currency: "USD",
        balance: 50000,
        todayChange: 1000,
        holdings: [],
      };

      const accountResource: AccountResource = {
        account_id: "ACC001",
        customer_id: "C001",
        account_type: "brokerage",
        currency: "USD",
        status: "active",
        opened_at: "2024-01-01T00:00:00Z",
      };

      const result: AccountDataResult = {
        customer,
        accounts: [account],
        accountResources: [accountResource],
      };

      expect(result.customer?.customer_id).toBe("C001");
      expect(result.accounts).toHaveLength(1);
      expect(result.accountResources).toHaveLength(1);
    });

    it("should allow null customer", () => {
      const result: AccountDataResult = {
        customer: null,
        accounts: [],
        accountResources: [],
      };

      expect(result.customer).toBeNull();
    });
  });

  describe("RegisterCustomerInput", () => {
    it("should accept valid registration input", () => {
      const input: RegisterCustomerInput = {
        name: "New User",
        email: "newuser@example.com",
      };

      expect(input.name).toBe("New User");
      expect(input.email).toBe("newuser@example.com");
    });

    it("should allow optional email", () => {
      const input: RegisterCustomerInput = {
        name: "Anonymous User",
      };

      expect(input.name).toBe("Anonymous User");
      expect(input.email).toBeUndefined();
    });
  });
});
