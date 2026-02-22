#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

lsof -i :8801 -t 2>/dev/null | xargs kill 2>/dev/null || true
lsof -i :8800 -t 2>/dev/null | xargs kill 2>/dev/null || true
cd apps/portfolio-analytics && docker compose down 2>/dev/null || true
cd "$ROOT"
echo "[stop-backend] Done."
