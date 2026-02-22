#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "[start-backend] Starting Docker..."
cd apps/portfolio-analytics
docker compose down 2>/dev/null || true
docker compose up -d
cd "$ROOT"
sleep 3

echo "[start-backend] Waiting for Postgres (5433)..."
for i in $(seq 1 30); do nc -z 127.0.0.1 5433 2>/dev/null && break; sleep 1; done
echo "[start-backend] Waiting for Kafka (9092)..."
for i in $(seq 1 20); do nc -z 127.0.0.1 9092 2>/dev/null && break; sleep 1; done
sleep 2

echo "[start-backend] Setting up Python venv..."
cd apps/portfolio-analytics
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
. .venv/bin/activate
.venv/bin/python -m pip install -r requirements.txt || { echo "pip install failed; check network and PyPI"; exit 1; }

lsof -i :8800 -t 2>/dev/null | xargs kill 2>/dev/null || true
sleep 1
.venv/bin/alembic upgrade head 2>/dev/null || true
echo "[start-backend] Starting Python :8800..."
.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8800 &
API_PID=$!
cd "$ROOT"

echo "[start-backend] Waiting for Python :8800..."
API_READY=
for i in $(seq 1 30); do
  curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 --max-time 5 http://127.0.0.1:8800/api/v1/portfolio 2>/dev/null | grep -q 200 && API_READY=1 && break
  sleep 1
done
[ -n "$API_READY" ] && echo "[start-backend] Python ready"

lsof -i :8801 -t 2>/dev/null | xargs kill 2>/dev/null || true
sleep 1
echo "[start-backend] Starting Go :8801..."
cd "$ROOT/apps/portfolio-api-go"
PYTHON_BACKEND_URL=http://127.0.0.1:8800 go run ./cmd/server &
GO_PID=$!
cd "$ROOT"

echo "[start-backend] Waiting for Go :8801..."
GO_READY=
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 --max-time 5 http://127.0.0.1:8801/health 2>/dev/null | grep -q 200 && GO_READY=1 && break
  sleep 1
done
[ -n "$GO_READY" ] && echo "[start-backend] Go ready"

if [ -n "$GO_READY" ]; then
  PORTFOLIO_API_URL=http://127.0.0.1:8801 node scripts/seed/generate-seed-data.js
fi

cleanup() { kill $API_PID $GO_PID 2>/dev/null; exit 0; }
trap cleanup SIGINT SIGTERM
echo ""
echo "API: http://127.0.0.1:8801  (Ctrl+C to stop)"
echo ""
wait $API_PID $GO_PID
