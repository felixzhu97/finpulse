# Scripts

Scripts are grouped by purpose:

| Folder | Purpose |
|--------|---------|
| **backend/** | Start server-python (Docker + Alembic + API + optional seed). `start-backend.sh` runs `alembic upgrade head` then uvicorn. |
| **seed/** | Seed data generators: `generate-seed-data.js` (POST to API). |
| **db/** | Fintech ER database: `schema.sql`, `seed.sql`, `run.sh`. See `db/README.md`. Note: server-python uses Alembic for schema; see `apps/server-python/alembic/`. |

Run from repo root, e.g. `pnpm run start:server`, `pnpm run generate-seed-data`, or `./scripts/db/run.sh`.
