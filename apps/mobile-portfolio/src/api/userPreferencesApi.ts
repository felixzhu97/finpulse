import type { UserPreference, UserPreferenceCreate } from "../types";
import { httpClient } from "./httpClient";

class UserPreferencesApi {
  async list(limit = 100, offset = 0): Promise<UserPreference[]> {
    return httpClient.getList<UserPreference>("user-preferences", limit, offset);
  }

  async getById(preferenceId: string): Promise<UserPreference | null> {
    return httpClient.getById<UserPreference>("user-preferences", preferenceId);
  }

  async getByCustomerId(customerId: string): Promise<UserPreference | null> {
    const list = await this.list(100, 0);
    return list.find((p) => p.customer_id === customerId) ?? null;
  }

  async create(body: UserPreferenceCreate): Promise<UserPreference | null> {
    return httpClient.post<UserPreference>("user-preferences", body);
  }

  async update(
    preferenceId: string,
    body: UserPreferenceCreate
  ): Promise<UserPreference | null> {
    return httpClient.put<UserPreference>("user-preferences", preferenceId, body);
  }
}

export const userPreferencesApi = new UserPreferencesApi();
