import type { Customer, CustomerCreate } from "@/src/types/customer";

export interface ICustomerRepository {
  getFirst(): Promise<Customer | null>;
  create(data: CustomerCreate): Promise<Customer | null>;
}
