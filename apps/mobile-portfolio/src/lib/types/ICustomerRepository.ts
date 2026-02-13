import type { Customer, CustomerCreate } from "@/src/lib/types/customer";

export interface ICustomerRepository {
  getFirst(): Promise<Customer | null>;
  create(data: CustomerCreate): Promise<Customer | null>;
}
