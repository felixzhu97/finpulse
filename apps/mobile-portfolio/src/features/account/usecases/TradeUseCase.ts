import type { AccountResource } from "@/src/features/account/entities/accountResource";
import type { Instrument } from "@/src/features/core/entities/instrument";
import type { Order } from "@/src/features/account/entities/order";
import type { Trade } from "@/src/features/account/entities/trade";
import type { IAccountRepository } from "@/src/features/account/repositories/IAccountRepository";
import type { IInstrumentRepository } from "@/src/features/account/repositories/IInstrumentRepository";
import type { IOrderRepository } from "@/src/features/account/repositories/IOrderRepository";
import type { ITradeRepository } from "@/src/features/account/repositories/ITradeRepository";

export class TradeUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private instrumentRepository: IInstrumentRepository,
    private orderRepository: IOrderRepository,
    private tradeRepository: ITradeRepository
  ) {}

  async getFormData(): Promise<{ accounts: AccountResource[]; instruments: Instrument[] }> {
    const [accounts, instruments] = await Promise.all([
      this.accountRepository.list(20, 0),
      this.instrumentRepository.list(50, 0),
    ]);
    return { accounts, instruments };
  }

  async createOrder(input: {
    accountId: string;
    instrumentId: string;
    side: "buy" | "sell";
    quantity: number;
  }): Promise<Order | null> {
    return this.orderRepository.create({
      account_id: input.accountId,
      instrument_id: input.instrumentId,
      side: input.side,
      quantity: input.quantity,
    });
  }

  async executeTrade(input: {
    orderId: string;
    quantity: number;
    price: number;
  }): Promise<Trade | null> {
    return this.tradeRepository.create({
      order_id: input.orderId,
      quantity: input.quantity,
      price: input.price,
    });
  }
}
