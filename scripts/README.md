# Scripts

Scripts are grouped by purpose:

| Folder | Purpose |
|--------|---------|
| **backend/** | Start portfolio-analytics (Docker + API + optional seed). `start-backend.sh` |
| **seed/** | Seed data generators: `generate-seed-data.js` (POST to API), `generate-ai-seed-data.js` (AI endpoints). Output: `seed/ai-seed-data.json` when using `--output`. |
| **db/** | Fintech ER database: `schema.sql`, `seed.sql`, `run.sh`. See `db/README.md`. |

Run from repo root, e.g. `pnpm run start:backend`, `pnpm run generate-seed-data`, or `./scripts/db/run.sh`.
