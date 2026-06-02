import type { AccountResource } from "@/src/types/accountResource";

// ============================================================
// Domain Test Values - 领域测试值
// ============================================================
const ACCOUNT_DOMAIN = {
  TYPES: ["brokerage", "savings", "checking", "creditCard", "cash"] as const,
  CURRENCIES: ["USD", "EUR", "GBP", "JPY", "CNY", "HKD"] as const,
  STATUSES: ["active", "inactive", "suspended", "closed"] as const,
  IDS: {
    PREFIX: "ACC",
    CUSTOMER_PREFIX: "CUST",
    TEST: "ACC001",
    CUSTOMER: "CUST001",
  } as const,
  TIMESTAMPS: {
    NOW: "2024-01-15T10:00:00Z",
    OPENED: "2024-01-01T00:00:00Z",
    ISO_MILLIS: "2024-01-15T10:00:00.000Z",
  } as const,
} as const;

const BOUNDARY_VALUES = {
  CURRENCY: [
    { value: "USD", desc: "US Dollar" },
    { value: "EUR", desc: "Euro" },
    { value: "GBP", desc: "British Pound" },
    { value: "JPY", desc: "Japanese Yen" },
    { value: "CNY", desc: "Chinese Yuan" },
    { value: "HKD", desc: "Hong Kong Dollar" },
  ],
  STATUS: [
    { value: "active", desc: "active status" },
    { value: "inactive", desc: "inactive status" },
    { value: "suspended", desc: "suspended status" },
    { value: "closed", desc: "closed status" },
  ],
  TYPE: [
    { value: "brokerage", desc: "brokerage account" },
    { value: "savings", desc: "savings account" },
    { value: "checking", desc: "checking account" },
    { value: "creditCard", desc: "credit card" },
    { value: "cash", desc: "cash account" },
  ],
} as const;

const SCENARIOS = {
  INTERNATIONAL: [
    { id: "ACC_US", currency: "USD", desc: "US account" },
    { id: "ACC_EU", currency: "EUR", desc: "EU account" },
    { id: "ACC_UK", currency: "GBP", desc: "UK account" },
  ] as const,
} as const;

// ============================================================
// Factory Functions - 工厂函数
// ============================================================
const createAccountResource = (
  overrides: Partial<AccountResource> = {}
): AccountResource => ({
  account_id: ACCOUNT_DOMAIN.IDS.TEST,
  customer_id: ACCOUNT_DOMAIN.IDS.CUSTOMER,
  account_type: "brokerage",
  currency: "USD",
  status: "active",
  opened_at: ACCOUNT_DOMAIN.TIMESTAMPS.OPENED,
  ...overrides,
});

// ============================================================
// Test Suites
// ============================================================
describe("AccountResource Entity", () => {
  describe("AccountResource interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete account resource data", () => {
        // Arrange
        const account = createAccountResource();

        // Assert
        expect(account.account_id).toBe(ACCOUNT_DOMAIN.IDS.TEST);
        expect(account.customer_id).toBe(ACCOUNT_DOMAIN.IDS.CUSTOMER);
        expect(account.account_type).toBe("brokerage");
        expect(account.currency).toBe("USD");
        expect(account.status).toBe("active");
        expect(account.opened_at).toBe(ACCOUNT_DOMAIN.TIMESTAMPS.OPENED);
      });
    });

    describe("when validating account types", () => {
      it.each(BOUNDARY_VALUES.TYPE)("should accept $desc", ({ value }) => {
        const account = createAccountResource({
          account_id: `ACC_${value}`,
          account_type: value,
        });
        expect(account.account_type).toBe(value);
      });
    });

    describe("when validating currencies", () => {
      it.each(BOUNDARY_VALUES.CURRENCY)("should accept $desc", ({ value }) => {
        const account = createAccountResource({
          account_id: `ACC_${value}`,
          currency: value,
        });
        expect(account.currency).toBe(value);
      });
    });

    describe("when validating statuses", () => {
      it.each(BOUNDARY_VALUES.STATUS)("should accept $desc", ({ value }) => {
        const account = createAccountResource({
          account_id: `ACC_${value}`,
          status: value,
        });
        expect(account.status).toBe(value);
      });
    });

    describe("when handling timestamps", () => {
      it("should accept ISO timestamp format with milliseconds", () => {
        const account = createAccountResource({
          opened_at: ACCOUNT_DOMAIN.TIMESTAMPS.ISO_MILLIS,
        });
        expect(new Date(account.opened_at).toISOString()).toBe(
          ACCOUNT_DOMAIN.TIMESTAMPS.ISO_MILLIS
        );
      });
    });

    describe("when modeling customer accounts", () => {
      it("should support multiple accounts for same customer", () => {
        const customerId = ACCOUNT_DOMAIN.IDS.CUSTOMER;
        const accounts: AccountResource[] = [
          createAccountResource({
            account_id: "ACC001",
            customer_id: customerId,
            account_type: "brokerage",
          }),
          createAccountResource({
            account_id: "ACC002",
            customer_id: customerId,
            account_type: "savings",
          }),
        ];

        expect(accounts).toHaveLength(2);
        expect(accounts.every((acc) => acc.customer_id === customerId)).toBe(
          true
        );
      });
    });

    describe("when modeling international accounts", () => {
      it.each(SCENARIOS.INTERNATIONAL)(
        "should support $desc",
        ({ id, currency }) => {
          const account = createAccountResource({
            account_id: id,
            currency,
          });

          expect(account.account_id).toBe(id);
          expect(account.currency).toBe(currency);
        }
      );

      it("should have multiple currencies for international customers", () => {
        const internationalAccounts: AccountResource[] = [
          createAccountResource({ account_id: "ACC_US", currency: "USD" }),
          createAccountResource({ account_id: "ACC_EU", currency: "EUR" }),
          createAccountResource({ account_id: "ACC_UK", currency: "GBP" }),
        ];

        const currencies = internationalAccounts.map((acc) => acc.currency);
        expect(currencies).toContain("USD");
        expect(currencies).toContain("EUR");
        expect(currencies).toContain("GBP");
      });
    });
  });
});
