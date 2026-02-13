import type { AccountResource } from "@/src/types/accountResource";
import type { Instrument } from "@/src/types/instrument";
import type { Order } from "@/src/types/order";
import type { Trade } from "@/src/types/trade";
import type { IAccountRepository } from "@/src/types/IAccountRepository";
import type { IInstrumentRepository } from "@/src/types/IInstrumentRepository";
import type { IOrderRepository } from "@/src/types/IOrderRepository";
import type { ITradeRepository } from "@/src/types/ITradeRepository";

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
