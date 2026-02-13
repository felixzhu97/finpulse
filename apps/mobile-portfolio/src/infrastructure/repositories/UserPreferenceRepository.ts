import type { UserPreference, UserPreferenceCreate } from "@/src/features/preferences/entities/userPreference";
import type { IUserPreferenceRepository } from "@/src/features/preferences/repositories/IUserPreferenceRepository";
import { httpClient } from "../api/httpClient";

export class UserPreferenceRepository implements IUserPreferenceRepository {
  async getByCustomerId(customerId: string): Promise<UserPreference | null> {
    const list = await httpClient.getList<UserPreference>("user-preferences", 100, 0);
    return list.find((p) => p.customer_id === customerId) ?? null;
  }

  async create(data: UserPreferenceCreate): Promise<UserPreference | null> {
    return httpClient.post<UserPreference>("user-preferences", {
      customer_id: data.customer_id,
      theme: data.theme ?? null,
      language: data.language ?? null,
      notifications_enabled: data.notifications_enabled ?? true,
    });
  }

  async update(
    customerId: string,
    data: Partial<UserPreferenceCreate>
  ): Promise<UserPreference | null> {
    const existing = await this.getByCustomerId(customerId);
    if (!existing) {
      const created = await httpClient.post<UserPreference>("user-preferences", {
        customer_id: customerId,
        ...data,
      });
      return created;
    }
    return httpClient.put<UserPreference>("user-preferences", existing.preference_id, {
      customer_id: customerId,
      ...data,
    });
  }
}
