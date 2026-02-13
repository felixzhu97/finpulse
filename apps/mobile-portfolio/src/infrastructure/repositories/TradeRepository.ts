import type { Trade, TradeCreate } from "../../domain/entities/trade";
import type { ITradeRepository } from "../../domain/repositories/ITradeRepository";
import { httpClient } from "../api/httpClient";

export class TradeRepository implements ITradeRepository {
  async list(limit = 100, offset = 0): Promise<Trade[]> {
    return httpClient.getList<Trade>("trades", limit, offset);
  }

  async getById(tradeId: string): Promise<Trade | null> {
    return httpClient.getById<Trade>("trades", tradeId);
  }

  async create(body: TradeCreate): Promise<Trade | null> {
    return httpClient.post<Trade>("trades", {
      order_id: body.order_id,
      quantity: body.quantity,
      price: body.price,
      fee: body.fee ?? 0,
    });
  }
}
