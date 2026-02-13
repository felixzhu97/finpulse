import type { AccountResource } from "@/src/features/account/entities/accountResource";
import type { Payment } from "@/src/features/account/entities/payment";
import type { IAccountRepository } from "@/src/features/account/repositories/IAccountRepository";
import type { IPaymentRepository } from "@/src/features/account/repositories/IPaymentRepository";

export class PaymentUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private paymentRepository: IPaymentRepository
  ) {}

  async getFormData(): Promise<AccountResource[]> {
    return this.accountRepository.list(20, 0);
  }

  async create(input: {
    accountId: string;
    amount: number;
    currency?: string;
    counterparty?: string;
  }): Promise<Payment | null> {
    return this.paymentRepository.create({
      account_id: input.accountId,
      amount: input.amount,
      currency: input.currency ?? "USD",
      counterparty: input.counterparty?.trim() || undefined,
    });
  }
}
