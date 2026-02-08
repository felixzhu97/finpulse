#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Starting PostgreSQL and Kafka..."
cd services/portfolio-analytics
docker compose up -d
cd "$ROOT"

echo "Waiting for PostgreSQL on 5433..."
for i in $(seq 1 30); do
  if nc -z 127.0.0.1 5433 2>/dev/null; then
    break
  fi
  sleep 1
done
sleep 2

cd services/portfolio-analytics
if [ ! -d .venv ]; then
  echo "Creating virtualenv and installing dependencies..."
  python3 -m venv .venv
  . .venv/bin/activate && pip install -q -r requirements.txt
fi

echo "Starting portfolio-analytics API on http://127.0.0.1:8800..."
nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8800 > /tmp/portfolio-api.log 2>&1 &
API_PID=$!
cd "$ROOT"

sleep 3
echo "Seeding database..."
node scripts/generate-seed-data.js || true

echo ""
echo "Backend is running:"
echo "  API:    http://127.0.0.1:8800"
echo "  Logs:   tail -f /tmp/portfolio-api.log"
echo "  Stop:   kill $API_PID  (or lsof -ti:8800 | xargs kill)"
