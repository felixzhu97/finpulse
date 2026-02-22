import type { Customer } from "../../domain/entities/customer";
import type { UserPreference } from "../../domain/entities/userPreference";
import type { AccountResource } from "../../domain/entities/accountResource";
import type { Instrument } from "../../domain/entities/instrument";
import type { Payment } from "../../domain/entities/payment";
import type { Trade } from "../../domain/entities/trade";
import type { Order } from "../../domain/entities/order";
import type {
  AccountDataResult,
  RegisterCustomerInput,
  UpdatePreferenceInput,
} from "../../domain/dto";
import { httpClient } from "../network/httpClient";
import { getPortfolioData } from "./portfolio";

export async function getCustomerFirst(): Promise<Customer | null> {
  const list = await httpClient.getList<Customer>("customers", 1, 0);
  return list[0] ?? null;
}

export async function registerCustomer(
  input: RegisterCustomerInput
): Promise<Customer | null> {
  return httpClient.post<Customer>("customers", {
    name: input.name.trim(),
    email: input.email?.trim() || undefined,
    kyc_status: undefined,
  });
}

export async function getUserPreference(): Promise<{
  preference: UserPreference | null;
  customerId: string | null;
}> {
  const customer = await getCustomerFirst();
  if (!customer) return { preference: null, customerId: null };
  const list = await httpClient.getList<UserPreference>(
    "user-preferences",
    100,
    0
  );
  let pref = list.find((p: UserPreference) => p.customer_id === customer.customer_id) ?? null;
  if (!pref) {
    pref = await httpClient.post<UserPreference>("user-preferences", {
      customer_id: customer.customer_id,
      theme: null,
      language: null,
      notifications_enabled: true,
    });
  }
  return {
    preference: pref ?? null,
    customerId: customer.customer_id,
  };
}

export async function updateUserPreference(
  customerId: string,
  data: UpdatePreferenceInput
): Promise<UserPreference | null> {
  const list = await httpClient.getList<UserPreference>(
    "user-preferences",
    100,
    0
  );
  const existing = list.find((p: UserPreference) => p.customer_id === customerId) ?? null;
  if (!existing) {
    return httpClient.post<UserPreference>("user-preferences", {
      customer_id: customerId,
      theme: data.theme ?? null,
      language: data.language ?? null,
      notifications_enabled: data.notificationsEnabled ?? true,
    });
  }
  return httpClient.put<UserPreference>(
    "user-preferences",
    existing.preference_id,
    {
      customer_id: customerId,
      theme: data.theme ?? undefined,
      language: data.language ?? undefined,
      notifications_enabled: data.notificationsEnabled,
    }
  );
}

export async function getAccountData(
  authCustomer?: Customer | null
): Promise<AccountDataResult> {
  const [customer, portfolioData, accountResources] = await Promise.all([
    authCustomer !== undefined ? Promise.resolve(authCustomer) : getCustomerFirst(),
    getPortfolioData(),
    httpClient.getList<AccountResource>("accounts", 100, 0),
  ]);
  return {
    customer: customer ?? null,
    accounts: portfolioData.portfolio?.accounts ?? [],
    accountResources: accountResources ?? [],
  };
}

export async function getPaymentFormData(): Promise<AccountResource[]> {
  return httpClient.getList<AccountResource>("accounts", 20, 0);
}

export async function createPayment(input: {
  accountId: string;
  amount: number;
  currency?: string;
  counterparty?: string;
}): Promise<Payment | null> {
  return httpClient.post<Payment>("payments", {
    account_id: input.accountId,
    amount: input.amount,
    currency: input.currency ?? "USD",
    counterparty: input.counterparty?.trim() || null,
    status: "pending",
  });
}

export async function getTradeFormData(): Promise<{
  accounts: AccountResource[];
  instruments: Instrument[];
}> {
  const [accounts, instruments] = await Promise.all([
    httpClient.getList<AccountResource>("accounts", 20, 0),
    httpClient.getList<Instrument>("instruments", 50, 0),
  ]);
  return { accounts, instruments };
}

export async function createOrder(input: {
  accountId: string;
  instrumentId: string;
  side: "buy" | "sell";
  quantity: number;
}): Promise<Order | null> {
  return httpClient.post<Order>("orders", {
    account_id: input.accountId,
    instrument_id: input.instrumentId,
    side: input.side,
    quantity: input.quantity,
    order_type: "market",
    status: "pending",
  });
}

export async function executeTrade(input: {
  orderId: string;
  quantity: number;
  price: number;
}): Promise<Trade | null> {
  return httpClient.post<Trade>("trades", {
    order_id: input.orderId,
    quantity: input.quantity,
    price: input.price,
    fee: 0,
  });
}
