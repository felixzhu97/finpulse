import type { Trade, TradeCreate } from "@/src/types/trade";

export interface ITradeRepository {
  list(limit?: number, offset?: number): Promise<Trade[]>;
  getById(tradeId: string): Promise<Trade | null>;
  create(body: TradeCreate): Promise<Trade | null>;
}
