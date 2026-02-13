import type { Order, OrderCreate } from "@/src/core/domain/entities/order";
import type { IOrderRepository } from "@/src/core/domain/repositories/IOrderRepository";
import { httpClient } from "@/src/infrastructure/network/httpClient";

export class OrderRepository implements IOrderRepository {
  async list(limit = 100, offset = 0): Promise<Order[]> {
    return httpClient.getList<Order>("orders", limit, offset);
  }

  async getById(orderId: string): Promise<Order | null> {
    return httpClient.getById<Order>("orders", orderId);
  }

  async create(body: OrderCreate): Promise<Order | null> {
    return httpClient.post<Order>("orders", {
      account_id: body.account_id,
      instrument_id: body.instrument_id,
      side: body.side,
      quantity: body.quantity,
      order_type: body.order_type ?? "market",
      status: body.status ?? "pending",
    });
  }
}
