import type { Customer } from "../../domain/entities/customer";
import { getBaseUrl } from "../network/config";
import { getAuthToken } from "../network/authBridge";

const AUTH_PREFIX = "/api/v1/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  customer: Customer;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

async function authRequest<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T | null> {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const { method = "GET", body } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) return null;
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export async function login(body: LoginRequest): Promise<LoginResponse | null> {
  return authRequest<LoginResponse>(`${AUTH_PREFIX}/login`, { method: "POST", body });
}

export async function register(body: RegisterRequest): Promise<LoginResponse | null> {
  return authRequest<LoginResponse>(`${AUTH_PREFIX}/register`, { method: "POST", body });
}

export async function getMe(): Promise<Customer | null> {
  return authRequest<Customer>(`${AUTH_PREFIX}/me`);
}

export async function logout(): Promise<void> {
  await authRequest<null>(`${AUTH_PREFIX}/logout`, { method: "POST", body: {} });
}

export async function changePassword(body: ChangePasswordRequest): Promise<boolean> {
  const res = await authRequest<{ ok?: boolean }>(`${AUTH_PREFIX}/change-password`, {
    method: "POST",
    body,
  });
  return res?.ok === true;
}
