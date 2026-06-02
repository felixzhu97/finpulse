const DEFAULT_PORT = 8801; // Go gateway (Python proxied via Go)

export function getBaseUrl(): string {
  const url = typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_BASE_URL;
  if (url && typeof url === "string") return url.replace(/\/$/, "");
  return `http://localhost:${DEFAULT_PORT}`;
}
