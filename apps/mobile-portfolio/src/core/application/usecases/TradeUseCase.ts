import type { AccountResource } from "../../domain/entities/accountResource";
import type { Instrument } from "../../domain/entities/instrument";
import type { Order } from "../../domain/entities/order";
import type { Trade } from "../../domain/entities/trade";
import type { IAccountRepository } from "../../domain/repositories/IAccountRepository";
import type { IInstrumentRepository } from "../../domain/repositories/IInstrumentRepository";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import type { ITradeRepository } from "../../domain/repositories/ITradeRepository";

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
