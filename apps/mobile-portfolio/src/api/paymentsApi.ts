import type { Payment, PaymentCreate } from "../types";
import { httpClient } from "./httpClient";

class PaymentsApi {
  async list(limit = 100, offset = 0): Promise<Payment[]> {
    return httpClient.getList<Payment>("payments", limit, offset);
  }

  async getById(paymentId: string): Promise<Payment | null> {
    return httpClient.getById<Payment>("payments", paymentId);
  }

  async create(body: PaymentCreate): Promise<Payment | null> {
    return httpClient.post<Payment>("payments", {
      account_id: body.account_id,
      counterparty: body.counterparty ?? null,
      amount: body.amount,
      currency: body.currency,
      status: body.status ?? "pending",
    });
  }
}

export const paymentsApi = new PaymentsApi();
