#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
if ! go build -o bin/server ./cmd/server 2>/dev/null; then
  echo "Run once (when you have network): GOPROXY=https://goproxy.cn,direct go mod tidy"
  echo "Or: GOPROXY=https://proxy.golang.org,direct go mod tidy"
  exit 1
fi
export PORT=${PORT:-8801}
export DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5433/portfolio}
echo "Starting on :$PORT (DB: ${DATABASE_URL%%@*}@...)"
exec ./bin/server
