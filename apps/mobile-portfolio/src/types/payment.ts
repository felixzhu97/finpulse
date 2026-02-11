export interface Payment {
  payment_id: string;
  account_id: string;
  counterparty: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  fraud_recommendation?: string | null;
  fraud_score?: number | null;
}

export interface PaymentCreate {
  account_id: string;
  counterparty?: string | null;
  amount: number;
  currency: string;
  status?: string;
}
