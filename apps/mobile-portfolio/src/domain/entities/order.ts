export interface Order {
  order_id: string;
  account_id: string;
  instrument_id: string;
  side: string;
  quantity: number;
  order_type: string;
  status: string;
  created_at: string;
}

export interface OrderCreate {
  account_id: string;
  instrument_id: string;
  side: string;
  quantity: number;
  order_type?: string;
  status?: string;
}
