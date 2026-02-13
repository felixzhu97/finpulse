import type { Payment, PaymentCreate } from "../entities/payment";

export interface IPaymentRepository {
  list(limit?: number, offset?: number): Promise<Payment[]>;
  getById(paymentId: string): Promise<Payment | null>;
  create(body: PaymentCreate): Promise<Payment | null>;
}
