export type AnalyticsEventName = string;

export type EventProperties = Record<string, string | number | boolean | undefined>;

export type UserTraits = Record<string, string | number | boolean | undefined>;

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties?: EventProperties;
  timestamp?: number;
}

export interface AnalyticsClient {
  track(name: AnalyticsEventName, properties?: EventProperties): void;
  identify(userId: string, traits?: UserTraits): void;
  flush?(): void | Promise<void>;
}

export interface AnalyticsTransport {
  track(event: AnalyticsEvent): void | Promise<void>;
}

export interface GrowthBookConfig {
  apiHost: string;
  clientKey: string;
  enableDevMode?: boolean;
  attributes?: Record<string, unknown>;
}
