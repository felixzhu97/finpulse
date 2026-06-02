import { Customer, CustomerCreate } from "@/src/types/customer";

// ============================================================
// Domain Test Values - 领域测试值
// ============================================================
const CUSTOMER_DOMAIN = {
  KYC_STATUSES: ["pending", "verified", "rejected", "expired"] as const,
  IDS: {
    PREFIX: "C",
    TEST: "C001",
    ACCOUNT: "ACC001",
  } as const,
  TIMESTAMPS: {
    NOW: "2024-01-01T00:00:00Z",
    PAST: "2023-01-01T00:00:00Z",
    FUTURE: "2025-12-31T23:59:59Z",
  } as const,
  EMAIL: {
    VALID: "john@example.com",
    ALTERNATIVE: "jane@example.com",
    ANONYMOUS: null,
  } as const,
  AI_SCORES: {
    HIGH: 0.95,
    MEDIUM: 0.75,
    LOW: 0.45,
    UNDEFINED: undefined,
    NULL: null,
  } as const,
  NAMES: {
    TYPICAL: "John Doe",
    SHORT: "JD",
    LONG: "Johnathan Alexander Maximilian Doe",
    ANONYMOUS: "Anonymous User",
  } as const,
} as const;

const BOUNDARY_VALUES = {
  EMAIL: [
    { value: "john@example.com", valid: true, desc: "valid email" },
    { value: null, valid: true, desc: "null email" },
    { value: "user+tag@domain.co.uk", valid: true, desc: "email with tag" },
  ] as const,
  AI_SCORE: [
    { value: 0.0, desc: "zero score" },
    { value: 0.5, desc: "medium score" },
    { value: 1.0, desc: "perfect score" },
    { value: null, desc: "null score" },
    { value: undefined, desc: "undefined score" },
  ] as const,
} as const;

// ============================================================
// Factory Functions - 工厂函数
// ============================================================
const createCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  customer_id: CUSTOMER_DOMAIN.IDS.TEST,
  name: CUSTOMER_DOMAIN.NAMES.TYPICAL,
  email: CUSTOMER_DOMAIN.EMAIL.VALID,
  kyc_status: "verified",
  created_at: CUSTOMER_DOMAIN.TIMESTAMPS.NOW,
  ai_identity_score: CUSTOMER_DOMAIN.AI_SCORES.HIGH,
  ...overrides,
});

const createCustomerCreate = (overrides: Partial<CustomerCreate> = {}): CustomerCreate => ({
  name: CUSTOMER_DOMAIN.NAMES.TYPICAL,
  email: CUSTOMER_DOMAIN.EMAIL.VALID,
  kyc_status: "pending",
  ...overrides,
});

// ============================================================
// Test Suites
// ============================================================
describe("Customer Entity", () => {
  describe("Customer interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete customer data", () => {
        // Arrange
        const customer = createCustomer();

        // Assert
        expect(customer.customer_id).toBe(CUSTOMER_DOMAIN.IDS.TEST);
        expect(customer.name).toBe(CUSTOMER_DOMAIN.NAMES.TYPICAL);
        expect(customer.email).toBe(CUSTOMER_DOMAIN.EMAIL.VALID);
        expect(customer.kyc_status).toBe("verified");
        expect(customer.ai_identity_score).toBe(CUSTOMER_DOMAIN.AI_SCORES.HIGH);
      });
    });

    describe("when validating KYC statuses", () => {
      it.each(CUSTOMER_DOMAIN.KYC_STATUSES)(
        "should accept status: %s",
        (kycStatus) => {
          const customer = createCustomer({ kyc_status: kycStatus });
          expect(customer.kyc_status).toBe(kycStatus);
        }
      );

      it.each([
        { value: null, desc: "null status" },
        { value: "pending", desc: "pending status" },
        { value: "verified", desc: "verified status" },
      ])("should accept $desc", ({ value }) => {
        const customer = createCustomer({ kyc_status: value });
        expect(customer.kyc_status).toBe(value);
      });
    });

    describe("when handling email field", () => {
      it.each([
        { email: "john@example.com", desc: "valid email" },
        { email: null, desc: "null email" },
        { email: "jane+tag@example.co.uk", desc: "email with plus tag" },
      ])("should accept $desc", ({ email }) => {
        const customer = createCustomer({ email });
        expect(customer.email).toBe(email);
      });
    });

    describe("when handling AI identity score", () => {
      it.each([
        { score: 0.0, desc: "zero score" },
        { score: 0.5, desc: "medium score" },
        { score: 1.0, desc: "perfect score" },
        { score: null, desc: "null score" },
      ])("should accept $desc", ({ score }) => {
        const customer = createCustomer({ ai_identity_score: score });
        expect(customer.ai_identity_score).toBe(score);
      });

      it("should default to high score when not specified", () => {
        const customer = createCustomer();
        expect(customer.ai_identity_score).toBe(CUSTOMER_DOMAIN.AI_SCORES.HIGH);
      });

      it.each([
        { score: 0.95, expected: "high" },
        { score: 0.75, expected: "medium" },
        { score: 0.45, expected: "low" },
      ])("should handle $expected identity score ($score)", ({ score }) => {
        const customer = createCustomer({ ai_identity_score: score });
        expect(customer.ai_identity_score).toBe(score);
      });
    });

    describe("when modeling real-world customers", () => {
      it.each([
        {
          id: "C_VERIFIED",
          name: "John Doe",
          email: "john@example.com",
          kycStatus: "verified",
          aiScore: 0.95,
          desc: "fully verified customer",
        },
        {
          id: "C_PENDING",
          name: "Jane Doe",
          email: null,
          kycStatus: "pending",
          aiScore: null,
          desc: "pending KYC customer",
        },
        {
          id: "C_ANONYMOUS",
          name: "Anonymous User",
          email: null,
          kycStatus: null,
          aiScore: undefined,
          desc: "anonymous user",
        },
        {
          id: "C_REJECTED",
          name: "Bob Smith",
          email: "bob@example.com",
          kycStatus: "rejected",
          aiScore: 0.3,
          desc: "rejected KYC customer",
        },
      ])(
        "should model $desc",
        ({ id, name, email, kycStatus, aiScore, desc }) => {
          const customer = createCustomer({
            customer_id: id,
            name,
            email,
            kyc_status: kycStatus,
            ai_identity_score: aiScore as Customer["ai_identity_score"],
          });

          expect(customer.customer_id).toBe(id);
          expect(customer.name).toBe(name);
          expect(customer.email).toBe(email);
          expect(customer.kyc_status).toBe(kycStatus);
        }
      );
    });
  });

  describe("CustomerCreate interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete customer creation data", () => {
        // Arrange
        const customerCreate = createCustomerCreate();

        // Assert
        expect(customerCreate.name).toBe(CUSTOMER_DOMAIN.NAMES.TYPICAL);
        expect(customerCreate.email).toBe(CUSTOMER_DOMAIN.EMAIL.VALID);
        expect(customerCreate.kyc_status).toBe("pending");
      });
    });

    describe("when handling optional fields", () => {
      it.each([
        { field: "email", value: CUSTOMER_DOMAIN.EMAIL.VALID, desc: "valid email" },
        { field: "email", value: null, desc: "null email" },
        { field: "email", value: undefined, desc: "undefined email" },
        { field: "kyc_status", value: "verified", desc: "verified status" },
        { field: "kyc_status", value: null, desc: "null status" },
        { field: "kyc_status", value: undefined, desc: "undefined status" },
      ])("should accept $desc", ({ field, value }) => {
        const customerCreate = createCustomerCreate({
          [field]: value,
        } as Partial<CustomerCreate>);
        expect(customerCreate[field]).toBe(value);
      });
    });

    describe("when validating minimal creation", () => {
      it("should accept minimal data with only name", () => {
        const customerCreate = createCustomerCreate({
          name: CUSTOMER_DOMAIN.NAMES.ANONYMOUS,
          email: undefined,
          kyc_status: undefined,
        });

        expect(customerCreate.name).toBe(CUSTOMER_DOMAIN.NAMES.ANONYMOUS);
        expect(customerCreate.email).toBeUndefined();
        expect(customerCreate.kyc_status).toBeUndefined();
      });
    });

    describe("when converting to Customer", () => {
      it("should properly map create to customer fields", () => {
        // Arrange
        const customerCreate = createCustomerCreate({
          name: "New Customer",
          email: "new@example.com",
          kyc_status: "pending",
        });

        // Act
        const customer: Customer = {
          customer_id: "C_NEW",
          name: customerCreate.name,
          email: customerCreate.email ?? null,
          kyc_status: customerCreate.kyc_status ?? null,
          created_at: new Date().toISOString(),
          ai_identity_score: null,
        };

        // Assert
        expect(customer.name).toBe("New Customer");
        expect(customer.email).toBe("new@example.com");
        expect(customer.kyc_status).toBe("pending");
      });
    });
  });
});
