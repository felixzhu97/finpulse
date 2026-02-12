#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "[stop-backend] Stopping API on :8800..."
lsof -i :8800 -t 2>/dev/null | xargs kill 2>/dev/null || true
sleep 1
lsof -i :8800 -t 2>/dev/null | xargs kill -9 2>/dev/null || true

echo "[stop-backend] Stopping Docker stack (portfolio-analytics)..."
cd services/portfolio-analytics
docker compose down 2>/dev/null || true
cd "$ROOT"
echo "[stop-backend] Done."
