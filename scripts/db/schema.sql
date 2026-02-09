CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE customer (
  customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  kyc_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_preference (
  preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES customer (customer_id) ON DELETE CASCADE,
  theme TEXT,
  language TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE account (
  account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer (customer_id) ON DELETE CASCADE,
  account_type TEXT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE instrument (
  instrument_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  name TEXT,
  asset_class TEXT,
  currency TEXT,
  exchange TEXT
);

CREATE TABLE portfolio (
  portfolio_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account (account_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  base_currency TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE watchlist (
  watchlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer (customer_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE position (
  position_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolio (portfolio_id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instrument (instrument_id) ON DELETE CASCADE,
  quantity NUMERIC(20, 8) NOT NULL,
  cost_basis NUMERIC(20, 8),
  as_of_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE watchlist_item (
  watchlist_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES watchlist (watchlist_id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instrument (instrument_id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (watchlist_id, instrument_id)
);

CREATE TABLE bond (
  bond_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID NOT NULL UNIQUE REFERENCES instrument (instrument_id) ON DELETE CASCADE,
  face_value NUMERIC(20, 8),
  coupon_rate NUMERIC(12, 6),
  ytm NUMERIC(12, 6),
  duration NUMERIC(12, 6),
  convexity NUMERIC(12, 6),
  maturity_years NUMERIC(8, 4),
  frequency INTEGER
);

CREATE TABLE option (
  option_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID NOT NULL UNIQUE REFERENCES instrument (instrument_id) ON DELETE CASCADE,
  underlying_instrument_id UUID NOT NULL REFERENCES instrument (instrument_id) ON DELETE CASCADE,
  strike NUMERIC(20, 8) NOT NULL,
  expiry TIMESTAMPTZ NOT NULL,
  option_type TEXT NOT NULL,
  risk_free_rate NUMERIC(12, 6),
  volatility NUMERIC(12, 6),
  bs_price NUMERIC(20, 8),
  delta NUMERIC(12, 6),
  gamma NUMERIC(12, 6),
  theta NUMERIC(12, 6),
  vega NUMERIC(12, 6),
  rho NUMERIC(12, 6),
  implied_volatility NUMERIC(12, 6)
);

CREATE TABLE orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account (account_id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instrument (instrument_id) ON DELETE CASCADE,
  side TEXT NOT NULL,
  quantity NUMERIC(20, 8) NOT NULL,
  order_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trade (
  trade_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (order_id) ON DELETE CASCADE,
  quantity NUMERIC(20, 8) NOT NULL,
  price NUMERIC(20, 8) NOT NULL,
  fee NUMERIC(20, 8) DEFAULT 0,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cash_transaction (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account (account_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC(20, 8) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account (account_id) ON DELETE CASCADE,
  counterparty TEXT,
  amount NUMERIC(20, 8) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE settlement (
  settlement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trade (trade_id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payment (payment_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  settled_at TIMESTAMPTZ
);

CREATE TABLE market_data (
  data_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID NOT NULL REFERENCES instrument (instrument_id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  open NUMERIC(20, 8),
  high NUMERIC(20, 8),
  low NUMERIC(20, 8),
  close NUMERIC(20, 8) NOT NULL,
  volume NUMERIC(20, 4),
  change_pct NUMERIC(12, 6)
);

CREATE TABLE technical_indicator (
  indicator_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID NOT NULL REFERENCES instrument (instrument_id) ON DELETE CASCADE,
  data_id UUID NOT NULL REFERENCES market_data (data_id) ON DELETE CASCADE,
  ma NUMERIC(20, 8),
  ema NUMERIC(20, 8),
  rsi NUMERIC(12, 6),
  macd NUMERIC(20, 8),
  volatility NUMERIC(12, 6),
  volume_metric NUMERIC(20, 8)
);

CREATE TABLE risk_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolio (portfolio_id) ON DELETE CASCADE,
  as_of_date DATE NOT NULL DEFAULT CURRENT_DATE,
  risk_level TEXT,
  volatility NUMERIC(12, 6),
  sharpe_ratio NUMERIC(12, 6),
  var NUMERIC(20, 8),
  beta NUMERIC(12, 6)
);

CREATE TABLE portfolio_optimization (
  optimization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolio (portfolio_id) ON DELETE CASCADE,
  as_of_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weights_json TEXT,
  expected_return NUMERIC(12, 6),
  variance NUMERIC(12, 6),
  sharpe_ratio NUMERIC(12, 6),
  efficient_frontier_json TEXT,
  constraints_json TEXT
);

CREATE TABLE statistical (
  stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id_1 UUID NOT NULL REFERENCES instrument (instrument_id) ON DELETE CASCADE,
  instrument_id_2 UUID NOT NULL REFERENCES instrument (instrument_id) ON DELETE CASCADE,
  as_of_date DATE NOT NULL DEFAULT CURRENT_DATE,
  correlation NUMERIC(12, 6),
  beta NUMERIC(12, 6),
  alpha NUMERIC(12, 6),
  fama_french_factors TEXT,
  regression_coefs TEXT
);

CREATE TABLE valuation (
  valuation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID NOT NULL REFERENCES instrument (instrument_id) ON DELETE CASCADE,
  as_of_date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT,
  ev NUMERIC(20, 8),
  equity_value NUMERIC(20, 8),
  target_price NUMERIC(20, 8),
  multiples NUMERIC(12, 6),
  discount_rate NUMERIC(12, 6),
  growth_rate NUMERIC(12, 6)
);

CREATE INDEX idx_account_customer ON account (customer_id);
CREATE INDEX idx_portfolio_account ON portfolio (account_id);
CREATE INDEX idx_position_portfolio ON position (portfolio_id);
CREATE INDEX idx_position_instrument ON position (instrument_id);
CREATE INDEX idx_orders_account ON orders (account_id);
CREATE INDEX idx_trade_order ON trade (order_id);
CREATE INDEX idx_market_data_instrument ON market_data (instrument_id);
CREATE INDEX idx_market_data_timestamp ON market_data (instrument_id, timestamp);
CREATE INDEX idx_risk_metrics_portfolio ON risk_metrics (portfolio_id);
