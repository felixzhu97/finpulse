from __future__ import annotations

import json
from typing import Any, Optional

try:
    import redis.asyncio as aioredis
except ImportError:
    aioredis = None

from src.infrastructure.config import REDIS_URL

BLOCKCHAIN_KEY_PREFIX = "blockchain:"
PORTFOLIO_AGGREGATE_KEY_PREFIX = "portfolio:aggregate:"
DEFAULT_TTL = 300


class RedisCache:
    def __init__(self, client: Optional[Any] = None):
        self._client = client

    async def get(self, key: str) -> Optional[Any]:
        if not self._client:
            return None
        try:
            raw = await self._client.get(key)
            if raw is None:
                return None
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return None

    async def set(self, key: str, value: Any, ttl_seconds: int = DEFAULT_TTL) -> bool:
        if not self._client:
            return False
        try:
            payload = json.dumps(value, default=str)
            await self._client.setex(key, ttl_seconds, payload)
            return True
        except (TypeError, ValueError):
            return False

    async def delete(self, *keys: str) -> None:
        if not self._client or not keys:
            return
        try:
            await self._client.delete(*keys)
        except Exception:
            pass

    async def delete_by_prefix(self, prefix: str) -> None:
        if not self._client:
            return
        try:
            cursor = 0
            while True:
                cursor, keys = await self._client.scan(cursor, match=f"{prefix}*", count=100)
                if keys:
                    await self._client.delete(*keys)
                if cursor == 0:
                    break
        except Exception:
            pass


def create_redis_client():
    if aioredis is None:
        return None
    try:
        return aioredis.from_url(REDIS_URL, decode_responses=True)
    except Exception:
        return None
