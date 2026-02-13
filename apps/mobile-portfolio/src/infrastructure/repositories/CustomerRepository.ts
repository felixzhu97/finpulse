import type { Customer, CustomerCreate } from "../../domain/entities/customer";
import type { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import { httpClient } from "../api/httpClient";

export class CustomerRepository implements ICustomerRepository {
  async getFirst(): Promise<Customer | null> {
    const list = await httpClient.getList<Customer>("customers", 1, 0);
    return list[0] ?? null;
  }

  async create(data: CustomerCreate): Promise<Customer | null> {
    return httpClient.post<Customer>("customers", {
      name: data.name,
      email: data.email ?? null,
      kyc_status: data.kyc_status ?? null,
    });
  }
}
