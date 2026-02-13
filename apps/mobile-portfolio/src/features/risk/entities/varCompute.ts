export interface VarComputeRequest {
  portfolio_id: string;
  confidence?: number;
  method?: string;
}

export interface VarComputeResult {
  var?: number;
  var_percent?: number;
  interpretation?: string;
  confidence?: number;
  method?: string;
  mean_return?: number;
  volatility?: number;
  portfolio_id?: string;
}
