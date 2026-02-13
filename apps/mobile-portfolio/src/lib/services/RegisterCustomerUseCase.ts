import type { Customer } from "@/src/lib/types/customer";
import type { ICustomerRepository } from "@/src/lib/types/ICustomerRepository";

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
