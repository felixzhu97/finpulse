import type { Order, OrderCreate } from "../entities/order";

export interface IOrderRepository {
  list(limit?: number, offset?: number): Promise<Order[]>;
  getById(orderId: string): Promise<Order | null>;
  create(body: OrderCreate): Promise<Order | null>;
}
