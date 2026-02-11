export interface Customer {
  customer_id: string;
  name: string;
  email: string | null;
  kyc_status: string | null;
  created_at: string;
}
