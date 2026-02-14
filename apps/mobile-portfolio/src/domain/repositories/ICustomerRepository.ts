import type { Customer, CustomerCreate } from "../entities/customer";

export interface ICustomerRepository {
  getFirst(): Promise<Customer | null>;
  create(data: CustomerCreate): Promise<Customer | null>;
}
