import json
from contextlib import contextmanager
from typing import Optional

import psycopg2
from psycopg2.extras import RealDictCursor

from app.config import DATABASE_URL


@contextmanager
def _connect():
  conn = psycopg2.connect(DATABASE_URL)
  try:
    yield conn
    conn.commit()
  except Exception:
    conn.rollback()
    raise
  finally:
    conn.close()


def init_db():
  with _connect() as conn:
    with conn.cursor() as cur:
      cur.execute(
        """
        CREATE TABLE IF NOT EXISTS portfolio (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL
        )
        """
      )


def load_portfolio_json(portfolio_id: str = "demo-portfolio") -> Optional[str]:
  init_db()
  with _connect() as conn:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
      cur.execute(
        "SELECT data FROM portfolio WHERE id = %s",
        (portfolio_id,),
      )
      row = cur.fetchone()
  if not row:
    return None
  data = row["data"]
  return json.dumps(data) if isinstance(data, dict) else data


def save_portfolio_json(portfolio_id: str, data: dict) -> None:
  init_db()
  with _connect() as conn:
    with conn.cursor() as cur:
      cur.execute(
        """
        INSERT INTO portfolio (id, data)
        VALUES (%s, %s::jsonb)
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
        """,
        (portfolio_id, json.dumps(data)),
      )
