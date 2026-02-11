# Blockchain Simulation & Digital Currency

This document describes the in-app blockchain simulation and digital currency feature in the portfolio analytics backend.

## Overview

- **Simulated chain**: Single chain of blocks (no mining or consensus). A single authority appends blocks when transfers are submitted.
- **Digital currency**: On-chain transfer records and per-account, per-currency wallet balances.
- **Integration**: Digital currency is an asset type keyed by `account_id`; balances are queryable and can be shown alongside other assets in portfolio views.

## Block Structure

- **Block**: `index`, `timestamp`, `previous_hash`, `transaction_ids`, `hash` (SHA256 of canonical JSON via `cryptography`).
- **ChainTransaction**: `tx_id`, `block_index`, `sender_account_id`, `receiver_account_id`, `amount`, `currency`, `created_at`.
- **WalletBalance**: `account_id`, `currency`, `balance`, `updated_at`.

Blocks are linked by `previous_hash`; the first block (genesis) uses `previous_hash = "0"`.

## Transaction Flow

1. Client calls `POST /api/v1/blockchain/transfers` with sender, receiver, amount, currency.
2. Application checks sender balance (no negative balances).
3. A new block is created with the single transfer; block hash is computed (pydantic `model_dump_json(sort_keys=True)` + SHA256).
4. Block and chain transaction are persisted; sender and receiver wallet balances are updated in the same DB transaction.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/blockchain/blocks` | List blocks (paginated). |
| GET | `/api/v1/blockchain/blocks/{block_index}` | Block detail with transactions. |
| POST | `/api/v1/blockchain/transfers` | Submit a transfer (body: sender_account_id, receiver_account_id, amount, currency). |
| GET | `/api/v1/blockchain/transactions/{tx_id}` | Single chain transaction. |
| GET | `/api/v1/blockchain/balances` | Wallet balance (query: account_id, currency). |

Default simulation currency is `SIM_COIN`; it can be used as an asset type in portfolio/asset views.

## Integration with Accounts and Assets

- Wallets are scoped by `account_id` (same as the Account entity).
- Balance endpoint uses existing `account_id`; frontend can show digital currency alongside other holdings.
- Payment/Settlement tables are unchanged; blockchain provides transfer and balance only. Future work may link payments with `blockchain_tx_id` or allow settling with `SIM_COIN`.
