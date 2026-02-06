export type CurrencyCode = "USD" | "EUR" | "CNY" | "JPY" | "HKD";

export type AccountType =
  | "brokerage"
  | "saving"
  | "checking"
  | "creditCard"
  | "cash";

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  costBasis: number;
  marketValue: number;
  profit: number;
  profitRate: number;
  assetClass: "equity" | "bond" | "cash" | "fund" | "other";
  riskLevel: "low" | "medium" | "high";
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: number;
  todayChange: number;
  holdings: Holding[];
}

export interface PortfolioSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  todayChange: number;
  weekChange: number;
}

export interface PortfolioHistoryPoint {
  date: string;
  value: number;
}

export interface Portfolio {
  id: string;
  ownerName: string;
  baseCurrency: CurrencyCode;
  accounts: Account[];
  summary: PortfolioSummary;
  history: PortfolioHistoryPoint[];
}

