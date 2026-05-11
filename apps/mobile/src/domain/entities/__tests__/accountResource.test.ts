import type { AccountResource } from "../../../domain/entities/accountResource";

describe("AccountResource Entity", () => {
  describe("AccountResource interface", () => {
    it("should accept valid account resource data", () => {
      const accountResource: AccountResource = {
        account_id: "ACC001",
        customer_id: "CUST001",
        account_type: "brokerage",
        currency: "USD",
        status: "active",
        opened_at: "2024-01-15T10:00:00Z",
      };

      expect(accountResource.account_id).toBe("ACC001");
      expect(accountResource.customer_id).toBe("CUST001");
      expect(accountResource.account_type).toBe("brokerage");
      expect(accountResource.currency).toBe("USD");
      expect(accountResource.status).toBe("active");
      expect(accountResource.opened_at).toBe("2024-01-15T10:00:00Z");
    });

    it("should accept savings account type", () => {
      const accountResource: AccountResource = {
        account_id: "ACC002",
        customer_id: "CUST001",
        account_type: "savings",
        currency: "USD",
        status: "active",
        opened_at: "2024-01-15T10:00:00Z",
      };

      expect(accountResource.account_type).toBe("savings");
    });

    it("should accept checking account type", () => {
      const accountResource: AccountResource = {
        account_id: "ACC003",
        customer_id: "CUST002",
        account_type: "checking",
        currency: "USD",
        status: "active",
        opened_at: "2024-01-15T10:00:00Z",
      };

      expect(accountResource.account_type).toBe("checking");
    });

    it("should accept various currency types", () => {
      const currencies = ["USD", "EUR", "GBP", "JPY", "CNY", "HKD"];

      currencies.forEach((currency) => {
        const accountResource: AccountResource = {
          account_id: `ACC_${currency}`,
          customer_id: "CUST001",
          account_type: "brokerage",
          currency,
          status: "active",
          opened_at: "2024-01-15T10:00:00Z",
        };

        expect(accountResource.currency).toBe(currency);
      });
    });

    it("should accept various account statuses", () => {
      const statuses = ["active", "inactive", "suspended", "closed"];

      statuses.forEach((status) => {
        const accountResource: AccountResource = {
          account_id: `ACC_${status}`,
          customer_id: "CUST001",
          account_type: "brokerage",
          currency: "USD",
          status,
          opened_at: "2024-01-15T10:00:00Z",
        };

        expect(accountResource.status).toBe(status);
      });
    });

    it("should accept ISO date format for opened_at", () => {
      const accountResource: AccountResource = {
        account_id: "ACC001",
        customer_id: "CUST001",
        account_type: "brokerage",
        currency: "USD",
        status: "active",
        opened_at: "2024-01-15T10:00:00.000Z",
      };

      expect(new Date(accountResource.opened_at).toISOString()).toBe("2024-01-15T10:00:00.000Z");
    });

    it("should handle multiple accounts for same customer", () => {
      const customerId = "CUST001";
      const accounts: AccountResource[] = [
        {
          account_id: "ACC001",
          customer_id: customerId,
          account_type: "brokerage",
          currency: "USD",
          status: "active",
          opened_at: "2024-01-01T00:00:00Z",
        },
        {
          account_id: "ACC002",
          customer_id: customerId,
          account_type: "savings",
          currency: "USD",
          status: "active",
          opened_at: "2024-01-15T00:00:00Z",
        },
      ];

      expect(accounts).toHaveLength(2);
      expect(accounts.every((acc) => acc.customer_id === customerId)).toBe(true);
    });

    it("should support international accounts with different currencies", () => {
      const internationalAccounts: AccountResource[] = [
        {
          account_id: "ACC_US",
          customer_id: "CUST001",
          account_type: "brokerage",
          currency: "USD",
          status: "active",
          opened_at: "2024-01-01T00:00:00Z",
        },
        {
          account_id: "ACC_EU",
          customer_id: "CUST001",
          account_type: "brokerage",
          currency: "EUR",
          status: "active",
          opened_at: "2024-01-01T00:00:00Z",
        },
        {
          account_id: "ACC_UK",
          customer_id: "CUST001",
          account_type: "brokerage",
          currency: "GBP",
          status: "active",
          opened_at: "2024-01-01T00:00:00Z",
        },
      ];

      expect(internationalAccounts).toHaveLength(3);
      const currencies = internationalAccounts.map((acc) => acc.currency);
      expect(currencies).toContain("USD");
      expect(currencies).toContain("EUR");
      expect(currencies).toContain("GBP");
    });
  });
});
