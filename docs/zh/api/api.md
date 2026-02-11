# 组合分析 API

基础路径：资源为 `/api/v1`；应用路由使用完整路径。支持查询参数：`limit`、`offset`（视接口而定）。

## 应用

| 方法 | 路径 | 说明 |
|--------|------|-------------|
| GET | `/api/v1/portfolio` | 聚合组合 |
| GET | `/api/v1/quotes` | 行情；查询参数 `symbols`（逗号分隔） |
| POST | `/api/v1/seed` | 初始化组合；请求体为组合数据 |
| WS | `/ws/quotes` | WebSocket；发送 `{ "type": "subscribe", "symbols": ["AAPL"] }` |

## 账户

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/accounts` |
| GET | `/api/v1/accounts/{account_id}` |
| POST | `/api/v1/accounts` |
| POST | `/api/v1/accounts/batch` |
| PUT | `/api/v1/accounts/{account_id}` |
| DELETE | `/api/v1/accounts/{account_id}` |

## 客户

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/customers` |
| GET | `/api/v1/customers/{customer_id}` |
| POST | `/api/v1/customers` |
| POST | `/api/v1/customers/batch` |
| PUT | `/api/v1/customers/{customer_id}` |
| DELETE | `/api/v1/customers/{customer_id}` |

## 用户偏好

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/user-preferences` |
| GET | `/api/v1/user-preferences/{preference_id}` |
| POST | `/api/v1/user-preferences` |
| POST | `/api/v1/user-preferences/batch` |
| PUT | `/api/v1/user-preferences/{preference_id}` |
| DELETE | `/api/v1/user-preferences/{preference_id}` |

## 标的

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/instruments` |
| GET | `/api/v1/instruments/{instrument_id}` |
| POST | `/api/v1/instruments` |
| POST | `/api/v1/instruments/batch` |
| PUT | `/api/v1/instruments/{instrument_id}` |
| DELETE | `/api/v1/instruments/{instrument_id}` |

## 债券

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/bonds` |
| GET | `/api/v1/bonds/{bond_id}` |
| POST | `/api/v1/bonds` |
| POST | `/api/v1/bonds/batch` |
| PUT | `/api/v1/bonds/{bond_id}` |
| DELETE | `/api/v1/bonds/{bond_id}` |

## 期权

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/options` |
| GET | `/api/v1/options/{option_id}` |
| POST | `/api/v1/options` |
| POST | `/api/v1/options/batch` |
| PUT | `/api/v1/options/{option_id}` |
| DELETE | `/api/v1/options/{option_id}` |

## 组合

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/portfolios` |
| GET | `/api/v1/portfolios/{portfolio_id}` |
| POST | `/api/v1/portfolios` |
| POST | `/api/v1/portfolios/batch` |
| PUT | `/api/v1/portfolios/{portfolio_id}` |
| DELETE | `/api/v1/portfolios/{portfolio_id}` |

## 持仓

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/positions` |
| GET | `/api/v1/positions/{position_id}` |
| POST | `/api/v1/positions` |
| POST | `/api/v1/positions/batch` |
| PUT | `/api/v1/positions/{position_id}` |
| DELETE | `/api/v1/positions/{position_id}` |

## 自选列表

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/watchlists` |
| GET | `/api/v1/watchlists/{watchlist_id}` |
| POST | `/api/v1/watchlists` |
| POST | `/api/v1/watchlists/batch` |
| PUT | `/api/v1/watchlists/{watchlist_id}` |
| DELETE | `/api/v1/watchlists/{watchlist_id}` |

## 自选项

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/watchlist-items` |
| GET | `/api/v1/watchlist-items/{watchlist_item_id}` |
| POST | `/api/v1/watchlist-items` |
| POST | `/api/v1/watchlist-items/batch` |
| PUT | `/api/v1/watchlist-items/{watchlist_item_id}` |
| DELETE | `/api/v1/watchlist-items/{watchlist_item_id}` |

## 订单

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/orders` |
| GET | `/api/v1/orders/{order_id}` |
| POST | `/api/v1/orders` |
| POST | `/api/v1/orders/batch` |
| PUT | `/api/v1/orders/{order_id}` |
| DELETE | `/api/v1/orders/{order_id}` |

## 成交

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/trades` |
| GET | `/api/v1/trades/{trade_id}` |
| POST | `/api/v1/trades` |
| POST | `/api/v1/trades/batch` |
| PUT | `/api/v1/trades/{trade_id}` |
| DELETE | `/api/v1/trades/{trade_id}` |

## 资金流水

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/cash-transactions` |
| GET | `/api/v1/cash-transactions/{transaction_id}` |
| POST | `/api/v1/cash-transactions` |
| POST | `/api/v1/cash-transactions/batch` |
| PUT | `/api/v1/cash-transactions/{transaction_id}` |
| DELETE | `/api/v1/cash-transactions/{transaction_id}` |

## 支付

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/payments` |
| GET | `/api/v1/payments/{payment_id}` |
| POST | `/api/v1/payments` |
| POST | `/api/v1/payments/batch` |
| PUT | `/api/v1/payments/{payment_id}` |
| DELETE | `/api/v1/payments/{payment_id}` |

## 结算

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/settlements` |
| GET | `/api/v1/settlements/{settlement_id}` |
| POST | `/api/v1/settlements` |
| POST | `/api/v1/settlements/batch` |
| PUT | `/api/v1/settlements/{settlement_id}` |
| DELETE | `/api/v1/settlements/{settlement_id}` |

## 行情数据

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/market-data` |
| GET | `/api/v1/market-data/{data_id}` |
| POST | `/api/v1/market-data` |
| POST | `/api/v1/market-data/batch` |
| PUT | `/api/v1/market-data/{data_id}` |
| DELETE | `/api/v1/market-data/{data_id}` |

## 风险指标

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/risk-metrics` |
| GET | `/api/v1/risk-metrics/{metric_id}` |
| POST | `/api/v1/risk-metrics` |
| POST | `/api/v1/risk-metrics/batch` |
| POST | `/api/v1/risk-metrics/compute` | 基于组合历史计算 VaR；请求体：`{ portfolio_id, confidence?, method? }` |
| PUT | `/api/v1/risk-metrics/{metric_id}` |
| DELETE | `/api/v1/risk-metrics/{metric_id}` |

## 估值

| 方法 | 路径 |
|--------|------|
| GET | `/api/v1/valuations` |
| GET | `/api/v1/valuations/{valuation_id}` |
| POST | `/api/v1/valuations` |
| POST | `/api/v1/valuations/batch` |
| PUT | `/api/v1/valuations/{valuation_id}` |
| DELETE | `/api/v1/valuations/{valuation_id}` |

## AI/ML 集成（融入业务流）

AI、ML、DL 已融入业务操作：

- **支付**（`POST /payments`）：响应包含 `fraud_recommendation`、`fraud_score`
- **交易**（`POST /trades`）：响应包含 `surveillance_alert`、`surveillance_score`
- **客户**（`POST /customers`）：响应包含 `ai_identity_score`
- **风险**（`POST /risk-metrics/compute`）：基于组合历史计算 VaR

请求/响应结构见 OpenAPI：`/docs`。
