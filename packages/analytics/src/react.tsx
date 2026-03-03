import { createContext, useContext, useEffect, useMemo } from "react";
import {
  GrowthBookProvider as GrowthBookProviderBase,
  useFeatureIsOn,
  useFeatureValue,
  useGrowthBook,
} from "@growthbook/growthbook-react";
import { createGrowthBook } from "./ab";
import { createAnalyticsClient, createNoopClient } from "./client";
import type { AnalyticsClient, AnalyticsTransport, GrowthBookConfig } from "./types";

const AnalyticsContext = createContext<AnalyticsClient | null>(null);

function AnalyticsProvider({
  transport,
  children,
}: {
  transport: AnalyticsTransport;
  children: React.ReactNode;
}) {
  const client = useMemo(() => createAnalyticsClient(transport), [transport]);
  return (
    <AnalyticsContext.Provider value={client}>{children}</AnalyticsContext.Provider>
  );
}

function useAnalytics(): AnalyticsClient {
  const client = useContext(AnalyticsContext);
  return client ?? createNoopClient();
}

function GrowthBookProvider({
  config,
  children,
}: {
  config: GrowthBookConfig;
  children: React.ReactNode;
}) {
  const gb = useMemo(() => createGrowthBook(config), [
    config.apiHost,
    config.clientKey,
  ]);
  useEffect(() => {
    gb.init({ streaming: true });
    return () => gb.destroy();
  }, [gb]);
  return (
    <GrowthBookProviderBase growthbook={gb}>{children}</GrowthBookProviderBase>
  );
}

export {
  AnalyticsProvider,
  GrowthBookProvider,
  useAnalytics,
  useFeatureIsOn,
  useFeatureValue,
  useGrowthBook,
};
