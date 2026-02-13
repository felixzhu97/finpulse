export interface Trade {
  trade_id: string;
  order_id: string;
  quantity: number;
  price: number;
  fee: number | null;
  executed_at: string;
  surveillance_alert?: string | null;
  surveillance_score?: number | null;
}

export interface TradeCreate {
  order_id: string;
  quantity: number;
  price: number;
  fee?: number | null;
}
