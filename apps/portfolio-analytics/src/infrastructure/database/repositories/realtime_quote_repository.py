import time
from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING, Dict, Iterable, Optional, Tuple

from sqlalchemy import create_engine, func, select, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from src.core.application.ports.repositories.realtime_quote_repository import IRealtimeQuoteRepository
from src.core.domain.entities.market_data import Quote
from src.infrastructure.config import DATABASE_URL
from src.infrastructure.database.models import QuoteTickRow, RealtimeQuoteRow

if TYPE_CHECKING:
    from src.infrastructure.cache.quote_cache import QuoteCache


def _to_float(val) -> float:
    if val is None:
        return 0.0
    return float(val)


class RealtimeQuoteRepository(IRealtimeQuoteRepository):
    def __init__(
        self,
        engine: Optional[Engine] = None,
        cache: Optional["QuoteCache"] = None,
    ) -> None:
        sync_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)
        self._engine = engine or create_engine(sync_url, pool_pre_ping=True)
        self._session_factory = sessionmaker(self._engine, class_=Session, autoflush=False)
        self._cache = cache

    def get_quotes(self, symbols: Iterable[str]) -> Dict[str, Quote]:
        requested = [str(s).strip().upper() for s in symbols if str(s).strip()]
        if not requested:
            return {}
        stmt = (
            select(
                RealtimeQuoteRow.symbol,
                RealtimeQuoteRow.price,
                RealtimeQuoteRow.change,
                RealtimeQuoteRow.change_rate,
                func.extract("epoch", RealtimeQuoteRow.updated_at).label("ts"),
            )
            .where(RealtimeQuoteRow.symbol.in_(requested))
        )
        with self._session_factory() as session:
            rows = session.execute(stmt).all()
        result: Dict[str, Quote] = {}
        for row in rows:
            symbol = str(row.symbol).upper()
            result[symbol] = Quote(
                symbol=symbol,
                price=_to_float(row.price),
                change=_to_float(row.change),
                change_rate=_to_float(row.change_rate),
                timestamp=_to_float(row.ts),
            )
        return result

    def upsert_quotes(self, quotes: Dict[str, Tuple[float, float, float]]) -> None:
        if not quotes:
            return
        values = [
            {
                "symbol": sym.upper(),
                "price": price,
                "change": change,
                "change_rate": change_rate,
            }
            for sym, (price, change, change_rate) in quotes.items()
        ]
        upsert = insert(RealtimeQuoteRow).values(values)
        stmt = upsert.on_conflict_do_update(
            index_elements=["symbol"],
            set_={
                "price": upsert.excluded.price,
                "change": upsert.excluded.change,
                "change_rate": upsert.excluded.change_rate,
                "updated_at": func.now(),
            },
        )
        with self._session_factory() as session:
            session.execute(stmt)
            session.commit()
        if self._cache:
            cached = {
                sym.upper(): Quote(sym.upper(), p, c, cr, time.time())
                for sym, (p, c, cr) in quotes.items()
            }
            self._cache.set_quotes(cached)

    def insert_ticks(self, quotes: Dict[str, Tuple[float, float, float]]) -> None:
        if not quotes:
            return
        now = datetime.now(timezone.utc)
        mappings = [
            {
                "ts": now,
                "symbol": sym.upper(),
                "price": price,
                "change": change,
                "change_rate": change_rate,
            }
            for sym, (price, change, change_rate) in quotes.items()
        ]
        with self._session_factory() as session:
            session.bulk_insert_mappings(QuoteTickRow, mappings)
            session.commit()

    def get_quote_history(
        self, symbols: Iterable[str], minutes: int = 5
    ) -> Dict[str, list]:
        requested = [str(s).strip().upper() for s in symbols if str(s).strip()]
        if not requested:
            return {}
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        stmt = (
            select(QuoteTickRow.symbol, QuoteTickRow.price)
            .where(QuoteTickRow.symbol.in_(requested))
            .where(QuoteTickRow.ts >= cutoff)
            .order_by(QuoteTickRow.symbol, QuoteTickRow.ts)
        )
        with self._session_factory() as session:
            rows = session.execute(stmt).all()
        result: Dict[str, list] = {s: [] for s in requested}
        for row in rows:
            key = str(row.symbol).upper()
            if key in result:
                result[key].append(_to_float(row.price))
        empty = [s for s in requested if not result.get(s)]
        if empty:
            fallback = self._get_ohlc_history_fallback(empty, minutes)
            for sym, prices in fallback.items():
                result[sym] = prices
        return result

    def _get_ohlc_history_fallback(
        self, symbols: list, minutes: int
    ) -> Dict[str, list]:
        try:
            with self._session_factory() as session:
                rows = session.execute(
                    text(
                        "SELECT symbol, close FROM quote_ohlc_1min "
                        "WHERE symbol = ANY(:symbols) AND bucket >= now() - make_interval(mins => :mins) "
                        "ORDER BY symbol, bucket"
                    ),
                    {"symbols": symbols, "mins": minutes},
                ).fetchall()
            out: Dict[str, list] = {}
            for row in rows:
                key = str(row.symbol).upper()
                if key not in out:
                    out[key] = []
                out[key].append(_to_float(row.close))
            return out
        except Exception:
            return {}
