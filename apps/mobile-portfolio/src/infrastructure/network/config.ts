export function getBaseUrl(): string {
  const url = typeof process !== "undefined" && process.env?.EXPO_PUBLIC_PORTFOLIO_API_URL;
  if (url && typeof url === "string") return url.replace(/\/$/, "");
  return "http://localhost:8800";
}
