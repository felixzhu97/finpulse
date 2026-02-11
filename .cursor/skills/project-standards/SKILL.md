---
name: project-standards
description: Keeps documentation and diagrams in sync with code changes; when API or resources change, add or update seed data using well-known real-world data. Use when editing code, adding features, refactoring, changing APIs, or when the user asks to update docs or diagrams.
---

# Project Standards

## When to Apply

- After changing code, APIs, or architecture
- When adding or modifying features
- When the user asks to update docs or diagrams

## Update Documentation and Diagrams Promptly

After any change that affects behavior, structure, or contracts:

- **README**: Update the root README and any README in the affected area (e.g. `apps/*/README.md`, `packages/*/README.md`, `docs/**/README.md`).
- **Code/API changes**: Update relevant API docs and any `.puml` diagrams under `docs/` that describe the same area.
- **Diagrams (English and Chinese)**: When updating diagrams, update both `docs/en/` and `docs/zh/` so they stay in sync (e.g. `docs/en/c4/`, `docs/zh/c4/`; `docs/en/domain/`, `docs/zh/domain/`; `docs/en/togaf/`, `docs/zh/togaf/`; `docs/en/er-diagram/`, `docs/zh/er-diagram/`).
- **New modules or layers**: Add or adjust C4/clean-architecture diagrams in both en and zh; keep layout in sync with code (e.g. `clean-architecture-portfolio-api.puml`).
- **Data/DB changes**: Update `docs/en/er-diagram/` and `docs/zh/er-diagram/` and any schema or data-architecture docs.

Do not leave docs or diagrams outdated; update them in the same change set when possible.

## Seed Data When API Changes

When API or resources change (new or modified endpoints, schemas, or domain entities exposed as API):

1. **Add or update seed data** so local/demo can be restored with one command.
2. **Use well-known, real-world data** only. No placeholders like `user1`, `test-xxx`, or `foo`.

| Type | Use (examples) | Avoid |
|------|----------------|-------|
| People/customers | Warren Buffett, Ray Dalio, Carl Icahn | user1, John Doe, Test User |
| Symbols/instruments | AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, JPM, SPY, QQQ | STOCK1, TEST, XXX |
| Company names | Apple Inc., Microsoft Corporation, Alphabet Inc. | Company A, Test Corp |
| Brokers/counterparties | Charles Schwab, Interactive Brokers, Fidelity, Vanguard | Broker1, Acme Inc |
| Bonds | US912828VM18 (2Y Treasury), US912828XG18 (10Y) | BOND001 |
| Options | AAPL250117C00230000 (AAPL Jan 2026 230 Call) | OPTION1 |

Numeric values (prices, quantities, rates) may be fictional; identifiers, names, and codes must follow the above style.

- **Script**: `scripts/seed/generate-seed-data.js`
- **Method**: Prefer `POST /api/v1/<resource>/batch`; legacy portfolio via `POST /api/v1/seed`.
- **Run**: From repo root `pnpm run generate-seed-data` (or via `pnpm run start:backend`).

For new resources, add `postBatch("/api/v1/<resource>/batch", [ ... ])` in `seedResources()` and update the final `console.log` resource count.

## Checklist Before Finishing a Task

- [ ] README and other docs that describe the changed area are updated
- [ ] English and Chinese diagrams that describe the changed area are updated
- [ ] If API/resources changed: seed data added or updated in `generate-seed-data.js` using well-known data; no placeholder names; `pnpm run generate-seed-data` succeeds (with API running)
