const defaultBaseUrl = "http://localhost:8800";

export function getPortfolioApiBaseUrl(): string {
  const env =
    typeof process !== "undefined" &&
    process.env &&
    process.env.EXPO_PUBLIC_PORTFOLIO_API_URL;
  if (env && typeof env === "string" && env.trim() !== "") {
    return env.replace(/\/$/, "");
  }
  return defaultBaseUrl;
}
