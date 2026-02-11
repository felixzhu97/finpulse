import type { Customer, CustomerCreate } from "../types";
import { httpClient } from "./httpClient";

class CustomersApi {
  async list(limit = 100, offset = 0): Promise<Customer[]> {
    return httpClient.getList<Customer>("customers", limit, offset);
  }

  async getById(customerId: string): Promise<Customer | null> {
    return httpClient.getById<Customer>("customers", customerId);
  }

  async getFirst(): Promise<Customer | null> {
    const tag = "[CustomersApi]";
    console.log(`${tag} getFirst start`);
    const list = await this.list(1, 0);
    const result = list[0] ?? null;
    console.log(`${tag} getFirst done:`, result != null);
    return result;
  }

  async create(body: CustomerCreate): Promise<Customer | null> {
    return httpClient.post<Customer>("customers", {
      name: body.name,
      email: body.email ?? null,
      kyc_status: body.kyc_status ?? null,
    });
  }
}

export const customersApi = new CustomersApi();
