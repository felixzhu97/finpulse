#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

cd services/portfolio-analytics
docker compose down 2>/dev/null || true
docker compose up -d
cd "$ROOT"

for i in $(seq 1 30); do nc -z 127.0.0.1 5433 2>/dev/null && break; sleep 1; done
sleep 2

cd services/portfolio-analytics
[ ! -d .venv ] && python3 -m venv .venv && . .venv/bin/activate && pip install -q -r requirements.txt

lsof -i :8800 -t 2>/dev/null | xargs kill 2>/dev/null || true
sleep 1
lsof -i :8800 -t 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8800 > /tmp/portfolio-api.log 2>&1 &
API_PID=$!
cd "$ROOT"

for i in $(seq 1 30); do
  curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 --max-time 5 http://127.0.0.1:8800/api/v1/portfolio 2>/dev/null | grep -q 200 && break
  sleep 1
done
node scripts/seed/generate-seed-data.js 2>/dev/null || true

echo "Backend: http://127.0.0.1:8800  (logs: tail -f /tmp/portfolio-api.log, stop: kill $API_PID)"
