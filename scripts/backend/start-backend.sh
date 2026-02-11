#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "[start-backend] ROOT=$ROOT"
echo "[start-backend] Starting Docker stack..."
cd services/portfolio-analytics
docker compose down 2>/dev/null || true
docker compose up -d
cd "$ROOT"
sleep 3

echo "[start-backend] Waiting for Postgres (5433)..."
for i in $(seq 1 15); do nc -z 127.0.0.1 5433 2>/dev/null && break; sleep 1; done
echo "[start-backend] Waiting for Kafka (9092)..."
for i in $(seq 1 20); do nc -z 127.0.0.1 9092 2>/dev/null && break; sleep 1; done
sleep 2

echo "[start-backend] Setting up Python venv..."
cd services/portfolio-analytics
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
. .venv/bin/activate
pip install -r requirements.txt || { echo "pip install failed; check network and PyPI"; exit 1; }

echo "[start-backend] Freeing port 8800..."
lsof -i :8800 -t 2>/dev/null | xargs kill 2>/dev/null || true
sleep 1
lsof -i :8800 -t 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

echo "[start-backend] Running migrations..."
.venv/bin/alembic upgrade head 2>/dev/null || true
echo "[start-backend] Starting API on :8800..."
nohup .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8800 > /tmp/portfolio-api.log 2>&1 &
API_PID=$!
cd "$ROOT"

echo "[start-backend] Waiting for API health (up to 15s)..."
API_READY=
for i in $(seq 1 15); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 --max-time 5 http://127.0.0.1:8800/api/v1/portfolio 2>/dev/null || echo "000")
  if [ "$CODE" = "200" ]; then
    API_READY=1
    echo "[start-backend] API ready (HTTP $CODE) after ${i}s"
    break
  fi
  [ "$(( i % 5 ))" = "0" ] && echo "[start-backend] Attempt $i/15: HTTP $CODE"
  sleep 1
done
if [ -z "$API_READY" ]; then
  echo "[start-backend] WARN: API did not return 200. Last code: $CODE. Check /tmp/portfolio-api.log"
  echo "[start-backend] Tail of API log:"
  tail -n 20 /tmp/portfolio-api.log 2>/dev/null || true
fi

echo "[start-backend] Running seed script (PORTFOLIO_API_URL=http://127.0.0.1:8800)..."
PORTFOLIO_API_URL=http://127.0.0.1:8800 node scripts/seed/generate-seed-data.js

cd services/portfolio-analytics
nohup .venv/bin/python scripts/mock_realtime_quotes.py > /tmp/portfolio-mq.log 2>&1 &
MQ_PID=$!
cd "$ROOT"

echo "Backend: http://127.0.0.1:8800  (logs: tail -f /tmp/portfolio-api.log, stop: kill $API_PID)"
echo "MQ mock quotes: tail -f /tmp/portfolio-mq.log, stop: kill $MQ_PID"
