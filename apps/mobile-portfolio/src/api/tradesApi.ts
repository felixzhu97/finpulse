import type { Trade, TradeCreate } from "../types";
import { httpClient } from "./httpClient";

class TradesApi {
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

export const tradesApi = new TradesApi();
