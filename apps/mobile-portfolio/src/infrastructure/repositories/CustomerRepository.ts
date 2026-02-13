import type { Customer, CustomerCreate } from "@/src/core/domain/entities/customer";
import type { ICustomerRepository } from "@/src/core/domain/repositories/ICustomerRepository";
import { httpClient } from "@/src/infrastructure/network/httpClient";

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
