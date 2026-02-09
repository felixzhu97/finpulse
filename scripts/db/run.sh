#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5433}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-fintech}"

export PGHOST PGPORT PGUSER PGDATABASE

if ! psql -d "$PGDATABASE" -c '\q' 2>/dev/null; then
  echo "Database $PGDATABASE does not exist. Create it first, e.g.:"
  echo "  createdb -h $PGHOST -p $PGPORT -U $PGUSER $PGDATABASE"
  echo "Or to use the existing 'portfolio' database:"
  echo "  PGDATABASE=portfolio $0"
  exit 1
fi

echo "Applying schema to $PGDATABASE..."
psql -d "$PGDATABASE" -f "$SCRIPT_DIR/schema.sql"
echo "Seeding data..."
psql -d "$PGDATABASE" -f "$SCRIPT_DIR/seed.sql"
echo "Done."
