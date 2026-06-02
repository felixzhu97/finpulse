import { getBaseUrl } from "./config";
import { getAuthToken } from "./authBridge";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

class HttpClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  private async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T | null> {
    const url = `${this.baseUrl}${path}`;
    const { method = "GET", body, headers = {} } = options;
    const isDev = typeof __DEV__ !== "undefined" && __DEV__;

    try {
      if (isDev) {
        console.log(`[API] ${method} ${path}`);
      }
      const token = getAuthToken();
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
      };
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (isDev) {
        console.log(`[API] ${method} ${path} -> ${response.status}`);
      }

      if (!response.ok) {
        if (isDev) {
          console.error(`[API] ${method} ${path} -> Error ${response.status}`);
        }
        return null;
      }

      if (response.status === 204) {
        return null as T;
      }

      const data = (await response.json()) as T;
      if (isDev) {
        const preview =
          typeof data === "object" && data !== null
            ? JSON.stringify(data).slice(0, 200) + (JSON.stringify(data).length > 200 ? "..." : "")
            : String(data);
        console.log(`[API] ${method} ${path} <-`, preview);
      }
      return data;
    } catch (err) {
      if (isDev) {
        console.log(`[API] ${method} ${path} -> error`, err);
      }
      return null;
    }
  }

  async get<T>(path: string): Promise<T | null> {
    return this.request<T>(path, { method: "GET" });
  }

  async getList<T>(
    resource: string,
    limit = 100,
    offset = 0
  ): Promise<T[]> {
    const path = `/api/v1/${resource}?limit=${limit}&offset=${offset}`;
    const result = await this.get<T[]>(path);
    return result ?? [];
  }

  async getById<T>(resource: string, id: string): Promise<T | null> {
    const path = `/api/v1/${resource}/${id}`;
    return this.get<T>(path);
  }

  async post<T>(resourceOrPath: string, body: unknown): Promise<T | null> {
    const path = resourceOrPath.startsWith("/")
      ? resourceOrPath
      : `/api/v1/${resourceOrPath}`;
    return this.request<T>(path, { method: "POST", body });
  }

  async put<T>(resource: string, id: string, body: unknown): Promise<T | null> {
    const path = `/api/v1/${resource}/${id}`;
    return this.request<T>(path, { method: "PUT", body });
  }

  async delete(resource: string, id: string): Promise<boolean> {
    const path = `/api/v1/${resource}/${id}`;
    const result = await this.request<null>(path, { method: "DELETE" });
    return result !== null;
  }
}

export const httpClient = new HttpClient();
