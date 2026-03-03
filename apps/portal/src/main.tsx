import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createConsoleTransport,
  createHttpTransport,
} from "@fintech/analytics";
import { AnalyticsProvider, GrowthBookProvider } from "@fintech/analytics/react";
import App from "./App";
import "./index.css";

const growthBookConfig = {
  apiHost: import.meta.env.VITE_GROWTHBOOK_API_HOST ?? "https://cdn.growthbook.io",
  clientKey: import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY ?? "sdk-dev",
  enableDevMode: import.meta.env.DEV,
};

const apiBase = import.meta.env.VITE_API_BASE_URL;
const analyticsTransport = apiBase ? createHttpTransport(apiBase, "portal") : createConsoleTransport();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GrowthBookProvider config={growthBookConfig}>
      <AnalyticsProvider transport={analyticsTransport}>
        <App />
      </AnalyticsProvider>
    </GrowthBookProvider>
  </StrictMode>
);
