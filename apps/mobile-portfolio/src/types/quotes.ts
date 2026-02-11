export interface QuoteData {
  price: number;
  change: number;
  changeRate: number;
  timestamp: number;
}

export type QuoteSnapshot = Record<string, QuoteData>;

export type QuoteConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";
