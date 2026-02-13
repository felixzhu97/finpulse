import type { UserPreference, UserPreferenceCreate } from "@/src/lib/types/userPreference";

export interface IUserPreferenceRepository {
  getByCustomerId(customerId: string): Promise<UserPreference | null>;
  create(data: UserPreferenceCreate): Promise<UserPreference | null>;
  update(customerId: string, data: Partial<UserPreferenceCreate>): Promise<UserPreference | null>;
}
