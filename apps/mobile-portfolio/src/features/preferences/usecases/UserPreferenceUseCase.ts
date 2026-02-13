import type { UserPreference } from "@/src/features/preferences/entities/userPreference";
import type { ICustomerRepository } from "@/src/features/account/repositories/ICustomerRepository";
import type { IUserPreferenceRepository } from "@/src/features/preferences/repositories/IUserPreferenceRepository";

export interface UpdatePreferenceInput {
  theme?: string | null;
  language?: string | null;
  notificationsEnabled?: boolean;
}

export class UserPreferenceUseCase {
  constructor(
    private customerRepository: ICustomerRepository,
    private userPreferenceRepository: IUserPreferenceRepository
  ) {}

  async get(): Promise<{ preference: UserPreference | null; customerId: string | null }> {
    const customer = await this.customerRepository.getFirst();
    if (!customer) return { preference: null, customerId: null };

    let pref = await this.userPreferenceRepository.getByCustomerId(customer.customer_id);
    if (!pref) {
      pref = await this.userPreferenceRepository.create({
        customer_id: customer.customer_id,
        theme: null,
        language: null,
        notifications_enabled: true,
      });
    }

    return {
      preference: pref ?? null,
      customerId: customer.customer_id,
    };
  }

  async update(customerId: string, data: UpdatePreferenceInput): Promise<UserPreference | null> {
    return this.userPreferenceRepository.update(customerId, {
      theme: data.theme,
      language: data.language ?? undefined,
      notifications_enabled: data.notificationsEnabled,
    });
  }
}
