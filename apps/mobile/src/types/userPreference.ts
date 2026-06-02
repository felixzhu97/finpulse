export interface UserPreference {
  preference_id: string;
  customer_id: string;
  theme: string | null;
  language: string | null;
  notifications_enabled: boolean;
  updated_at: string;
}

export interface UserPreferenceCreate {
  customer_id: string;
  theme?: string | null;
  language?: string | null;
  notifications_enabled?: boolean;
}
