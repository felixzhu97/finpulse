import {
  Customer,
  CustomerCreate,
} from "../../../domain/entities/customer";

describe("Customer Entity", () => {
  describe("Customer interface", () => {
    it("should accept valid customer data", () => {
      const customer: Customer = {
        customer_id: "C001",
        name: "John Doe",
        email: "john@example.com",
        kyc_status: "verified",
        created_at: "2024-01-01T00:00:00Z",
        ai_identity_score: 0.95,
      };

      expect(customer.customer_id).toBe("C001");
      expect(customer.name).toBe("John Doe");
      expect(customer.email).toBe("john@example.com");
      expect(customer.kyc_status).toBe("verified");
      expect(customer.created_at).toBe("2024-01-01T00:00:00Z");
      expect(customer.ai_identity_score).toBe(0.95);
    });

    it("should allow null email", () => {
      const customer: Customer = {
        customer_id: "C002",
        name: "Jane Doe",
        email: null,
        kyc_status: "pending",
        created_at: "2024-01-02T00:00:00Z",
      };

      expect(customer.email).toBeNull();
      expect(customer.kyc_status).toBe("pending");
    });

    it("should allow null kyc_status", () => {
      const customer: Customer = {
        customer_id: "C003",
        name: "Bob Smith",
        email: "bob@example.com",
        kyc_status: null,
        created_at: "2024-01-03T00:00:00Z",
      };

      expect(customer.kyc_status).toBeNull();
    });

    it("should allow optional ai_identity_score", () => {
      const customer: Customer = {
        customer_id: "C004",
        name: "Alice Johnson",
        email: "alice@example.com",
        kyc_status: "verified",
        created_at: "2024-01-04T00:00:00Z",
      };

      expect(customer.ai_identity_score).toBeUndefined();
    });

    it("should accept ai_identity_score as null", () => {
      const customer: Customer = {
        customer_id: "C005",
        name: "Charlie Brown",
        email: "charlie@example.com",
        kyc_status: "pending",
        created_at: "2024-01-05T00:00:00Z",
        ai_identity_score: null,
      };

      expect(customer.ai_identity_score).toBeNull();
    });
  });

  describe("CustomerCreate interface", () => {
    it("should accept valid customer creation data", () => {
      const customerCreate: CustomerCreate = {
        name: "New Customer",
        email: "new@example.com",
        kyc_status: "pending",
      };

      expect(customerCreate.name).toBe("New Customer");
      expect(customerCreate.email).toBe("new@example.com");
      expect(customerCreate.kyc_status).toBe("pending");
    });

    it("should allow optional email", () => {
      const customerCreate: CustomerCreate = {
        name: "Anonymous User",
      };

      expect(customerCreate.email).toBeUndefined();
    });

    it("should allow null email", () => {
      const customerCreate: CustomerCreate = {
        name: "Anonymous",
        email: null,
      };

      expect(customerCreate.email).toBeNull();
    });

    it("should allow optional kyc_status", () => {
      const customerCreate: CustomerCreate = {
        name: "Basic User",
      };

      expect(customerCreate.kyc_status).toBeUndefined();
    });

    it("should allow null kyc_status", () => {
      const customerCreate: CustomerCreate = {
        name: "Neutral User",
        kyc_status: null,
      };

      expect(customerCreate.kyc_status).toBeNull();
    });
  });
});
