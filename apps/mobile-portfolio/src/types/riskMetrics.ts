export interface RiskMetrics {
  metric_id: string;
  portfolio_id: string;
  as_of_date: string;
  risk_level: string | null;
  volatility: number | null;
  sharpe_ratio: number | null;
  var: number | null;
  beta: number | null;
}
