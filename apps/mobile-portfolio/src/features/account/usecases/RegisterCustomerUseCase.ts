import type { Customer } from "@/src/features/account/entities/customer";
import type { ICustomerRepository } from "@/src/features/account/repositories/ICustomerRepository";

export interface RegisterCustomerInput {
  name: string;
  email?: string;
}

export class RegisterCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(input: RegisterCustomerInput): Promise<Customer | null> {
    return this.customerRepository.create({
      name: input.name.trim(),
      email: input.email?.trim() || undefined,
    });
  }
}
