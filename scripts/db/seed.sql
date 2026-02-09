INSERT INTO customer (customer_id, name, email, kyc_status) VALUES
  ('a0000001-0000-4000-8000-000000000001', 'Alice Chen', 'alice@example.com', 'verified'),
  ('a0000001-0000-4000-8000-000000000002', 'Bob Smith', 'bob@example.com', 'pending')
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO user_preference (preference_id, customer_id, theme, language, notifications_enabled) VALUES
  ('b0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000001', 'light', 'en', true),
  ('b0000001-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000002', 'dark', 'en', false)
ON CONFLICT (preference_id) DO NOTHING;

INSERT INTO account (account_id, customer_id, account_type, currency, status) VALUES
  ('c0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000001', 'brokerage', 'USD', 'active'),
  ('c0000001-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000001', 'cash', 'USD', 'active'),
  ('c0000001-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000002', 'brokerage', 'USD', 'active')
ON CONFLICT (account_id) DO NOTHING;

INSERT INTO instrument (instrument_id, symbol, name, asset_class, currency, exchange) VALUES
  ('d0000001-0000-4000-8000-000000000001', 'AAPL', 'Apple Inc', 'equity', 'USD', 'NASDAQ'),
  ('d0000001-0000-4000-8000-000000000002', 'MSFT', 'Microsoft Corporation', 'equity', 'USD', 'NASDAQ'),
  ('d0000001-0000-4000-8000-000000000003', 'US912828VM18', 'US 2Y Treasury', 'bond', 'USD', 'OTC'),
  ('d0000001-0000-4000-8000-000000000004', 'SPY', 'SPDR S&P 500 ETF', 'etf', 'USD', 'NYSE')
ON CONFLICT (instrument_id) DO NOTHING;

INSERT INTO portfolio (portfolio_id, account_id, name, base_currency) VALUES
  ('e0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000001', 'Growth', 'USD'),
  ('e0000001-0000-4000-8000-000000000002', 'c0000001-0000-4000-8000-000000000003', 'Retirement', 'USD')
ON CONFLICT (portfolio_id) DO NOTHING;

INSERT INTO watchlist (watchlist_id, customer_id, name) VALUES
  ('f0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000001', 'Tech')
ON CONFLICT (watchlist_id) DO NOTHING;

INSERT INTO watchlist_item (watchlist_item_id, watchlist_id, instrument_id) VALUES
  ('f1000001-0000-4000-8000-000000000001', 'f0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001'),
  ('f1000001-0000-4000-8000-000000000002', 'f0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000002')
ON CONFLICT (watchlist_item_id) DO NOTHING;

INSERT INTO position (position_id, portfolio_id, instrument_id, quantity, cost_basis, as_of_date) VALUES
  ('p0000001-0000-4000-8000-000000000001', 'e0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001', 100, 150.00, CURRENT_DATE),
  ('p0000001-0000-4000-8000-000000000002', 'e0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000002', 50, 380.00, CURRENT_DATE),
  ('p0000001-0000-4000-8000-000000000003', 'e0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000004', 20, 450.00, CURRENT_DATE)
ON CONFLICT (position_id) DO NOTHING;

INSERT INTO bond (bond_id, instrument_id, face_value, coupon_rate, ytm, duration, convexity, maturity_years, frequency) VALUES
  ('b0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000003', 1000, 0.045, 0.047, 1.92, 4.2, 2, 2)
ON CONFLICT (bond_id) DO NOTHING;

INSERT INTO orders (order_id, account_id, instrument_id, side, quantity, order_type, status) VALUES
  ('o0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001', 'buy', 100, 'market', 'filled')
ON CONFLICT (order_id) DO NOTHING;

INSERT INTO trade (trade_id, order_id, quantity, price, fee, executed_at) VALUES
  ('t0000001-0000-4000-8000-000000000001', 'o0000001-0000-4000-8000-000000000001', 100, 175.50, 1.00, now() - interval '1 day')
ON CONFLICT (trade_id) DO NOTHING;

INSERT INTO cash_transaction (transaction_id, account_id, type, amount, currency, status) VALUES
  ('x0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000002', 'deposit', 10000.00, 'USD', 'completed')
ON CONFLICT (transaction_id) DO NOTHING;

INSERT INTO payment (payment_id, account_id, counterparty, amount, currency, status) VALUES
  ('y0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000001', 'Broker XYZ', 17551.00, 'USD', 'completed')
ON CONFLICT (payment_id) DO NOTHING;

INSERT INTO settlement (settlement_id, trade_id, payment_id, status, settled_at) VALUES
  ('s0000001-0000-4000-8000-000000000001', 't0000001-0000-4000-8000-000000000001', 'y0000001-0000-4000-8000-000000000001', 'settled', now())
ON CONFLICT (settlement_id) DO NOTHING;

INSERT INTO market_data (data_id, instrument_id, timestamp, open, high, low, close, volume, change_pct) VALUES
  ('m0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001', now() - interval '1 hour', 178.20, 179.00, 177.80, 178.50, 25000000, 0.45),
  ('m0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000002', now() - interval '1 hour', 420.00, 422.50, 419.00, 421.00, 15000000, 0.30)
ON CONFLICT (data_id) DO NOTHING;

INSERT INTO technical_indicator (indicator_id, instrument_id, data_id, ma, ema, rsi, macd, volatility, volume_metric) VALUES
  ('i0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001', 'm0000001-0000-4000-8000-000000000001', 177.80, 178.20, 55.5, 0.35, 0.22, 25000000)
ON CONFLICT (indicator_id) DO NOTHING;

INSERT INTO risk_metrics (metric_id, portfolio_id, as_of_date, risk_level, volatility, sharpe_ratio, var, beta) VALUES
  ('r0000001-0000-4000-8000-000000000001', 'e0000001-0000-4000-8000-000000000001', CURRENT_DATE, 'moderate', 0.18, 1.25, 2500.00, 1.05)
ON CONFLICT (metric_id) DO NOTHING;

INSERT INTO portfolio_optimization (optimization_id, portfolio_id, as_of_date, expected_return, variance, sharpe_ratio, weights_json, constraints_json) VALUES
  ('q0000001-0000-4000-8000-000000000001', 'e0000001-0000-4000-8000-000000000001', CURRENT_DATE, 0.08, 0.032, 1.20, '[0.4, 0.35, 0.25]', '{"max_single": 0.5}')
ON CONFLICT (optimization_id) DO NOTHING;

INSERT INTO statistical (stat_id, instrument_id_1, instrument_id_2, as_of_date, correlation, beta, alpha) VALUES
  ('s0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000002', CURRENT_DATE, 0.72, 1.02, 0.015)
ON CONFLICT (stat_id) DO NOTHING;

INSERT INTO valuation (valuation_id, instrument_id, as_of_date, method, ev, equity_value, target_price, discount_rate, growth_rate) VALUES
  ('v0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001', CURRENT_DATE, 'DCF', 2800000000000, 2750000000000, 195.00, 0.08, 0.05)
ON CONFLICT (valuation_id) DO NOTHING;
