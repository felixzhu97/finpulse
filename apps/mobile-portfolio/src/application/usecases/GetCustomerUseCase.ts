import type { Customer, CustomerCreate } from "../../domain/entities/customer";
import type { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";

export class GetCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(): Promise<Customer | null> {
    return this.customerRepository.getFirst();
  }

  async create(data: CustomerCreate): Promise<Customer | null> {
    return this.customerRepository.create(data);
  }
}
