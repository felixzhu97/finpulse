# 区块链模拟与数字货币

本文描述投资组合分析后端中的应用内区块链模拟与数字货币功能。

## 概述

- **模拟链**：单链式区块（无挖矿与共识），由单一权威在用户提交转账时按序出块。
- **数字货币**：链上转账记录与按账户、按币种的钱包余额。
- **整合**：数字货币作为按 `account_id` 区分的资产类型；可查询余额并在组合视图中与其他资产一并展示。

## 区块结构

- **Block**：`index`、`timestamp`、`previous_hash`、`transaction_ids`、`hash`（由 `cryptography` 对规范 JSON 做 SHA256）。
- **ChainTransaction**：`tx_id`、`block_index`、`sender_account_id`、`receiver_account_id`、`amount`、`currency`、`created_at`。
- **WalletBalance**：`account_id`、`currency`、`balance`、`updated_at`。

区块通过 `previous_hash` 串联；创世区块使用 `previous_hash = "0"`。

## 交易流程

1. 客户端调用 `POST /api/v1/blockchain/transfers`，传入发送方、接收方、金额、币种。
2. 应用校验发送方余额（禁止负余额）。
3. 创建新区块（仅含该笔转账），计算区块哈希（pydantic `model_dump_json(sort_keys=True)` + SHA256）。
4. 在同一 DB 事务中持久化区块与链上交易，并更新发送方与接收方钱包余额。

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/blockchain/blocks` | 分页列出区块。 |
| GET | `/api/v1/blockchain/blocks/{block_index}` | 区块详情（含交易列表）。 |
| POST | `/api/v1/blockchain/transfers` | 提交转账（body：sender_account_id、receiver_account_id、amount、currency）。 |
| GET | `/api/v1/blockchain/transactions/{tx_id}` | 单笔链上交易。 |
| GET | `/api/v1/blockchain/balances` | 钱包余额（查询参数：account_id、currency）。 |

默认模拟币种为 `SIM_COIN`，可在组合/资产视图中作为资产类型使用。

## 与账户及资产的整合

- 钱包按 `account_id` 区分（与账户实体一致）。
- 余额接口使用现有 `account_id`；前端可将数字货币与其他持仓一起展示。
- 支付/结算表结构未改；区块链仅提供转账与余额。后续可扩展：在支付中记录 `blockchain_tx_id` 或支持使用 `SIM_COIN` 结算。
