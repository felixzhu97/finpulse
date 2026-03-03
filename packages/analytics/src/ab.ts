import { GrowthBook } from "@growthbook/growthbook";
import type { GrowthBookConfig } from "./types";

function createGrowthBook(config: GrowthBookConfig): GrowthBook {
  const gb = new GrowthBook({
    apiHost: config.apiHost,
    clientKey: config.clientKey,
    enableDevMode: config.enableDevMode ?? false,
    attributes: config.attributes,
  });
  return gb;
}

export { GrowthBook, createGrowthBook };
export type { GrowthBookConfig };
