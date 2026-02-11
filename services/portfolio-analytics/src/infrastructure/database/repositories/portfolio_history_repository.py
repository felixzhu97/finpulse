import json
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.config import HISTORY_CACHE_TTL_SECONDS
from src.core.domain.value_objects.portfolio import HistoryPoint
from src.core.application.ports.repositories.portfolio_repository import IPortfolioHistoryRepository
from src.infrastructure.database.models import PortfolioHistoryRow

_CACHE_KEY_PREFIX = "portfolio:history:"


class PortfolioHistoryRepository(IPortfolioHistoryRepository):
    def __init__(self, session: AsyncSession, redis_client: Optional[object] = None):
        self._session = session
        self._redis = redis_client

    async def get_range(self, portfolio_id: str, days: int = 30) -> List[HistoryPoint]:
        redis_client = self._redis
        cache_key = f"{_CACHE_KEY_PREFIX}{portfolio_id}:{days}d"
        if redis_client:
            try:
                cached = await redis_client.get(cache_key)
                if cached:
                    data = json.loads(cached)
                    return [HistoryPoint(d["date"], d["value"]) for d in data]
            except Exception:
                pass

        since = datetime.now(timezone.utc) - timedelta(days=days)
        try:
            result = await self._session.execute(
                select(PortfolioHistoryRow)
                .where(
                    PortfolioHistoryRow.portfolio_id == portfolio_id,
                    PortfolioHistoryRow.time >= since,
                )
                .order_by(PortfolioHistoryRow.time.asc())
            )
            rows = result.scalars().all()
        except Exception:
            return []

        points = []
        for row in rows:
            t = row.time
            date_str = t.strftime("%Y-%m-%d") if hasattr(t, "strftime") else str(t)[:10]
            points.append(HistoryPoint(date_str, float(row.value)))

        if redis_client and points:
            try:
                payload = [{"date": p.date, "value": p.value} for p in points]
                await redis_client.setex(
                    cache_key,
                    HISTORY_CACHE_TTL_SECONDS,
                    json.dumps(payload),
                )
            except Exception:
                pass

        return points

    async def append(self, portfolio_id: str, points: List[HistoryPoint]) -> None:
        if not points:
            return
        values = []
        for p in points:
            try:
                ts = datetime.strptime(p.date, "%Y-%m-%d").replace(
                    hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
                )
                values.append({"time": ts, "portfolio_id": portfolio_id, "value": p.value})
            except ValueError:
                continue
        if not values:
            return
        try:
            insert_stmt = insert(PortfolioHistoryRow).values(values)
            stmt = insert_stmt.on_conflict_do_update(
                index_elements=["portfolio_id", "time"],
                set_={"value": insert_stmt.excluded.value},
            )
            await self._session.execute(stmt)
        except Exception:
            return

        redis_client = self._redis
        if redis_client:
            try:
                keys = [f"{_CACHE_KEY_PREFIX}{portfolio_id}:{d}d" for d in [7, 30, 90]]
                await redis_client.delete(*keys)
            except Exception:
                pass
