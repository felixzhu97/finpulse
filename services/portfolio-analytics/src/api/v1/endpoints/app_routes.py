from typing import Annotated, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect

from src.api.v1.mappers.portfolio_assembler import assemble_portfolio
from src.api.config import CACHE_TTL_SECONDS, PORTFOLIO_AGGREGATE_KEY_PREFIX
from src.api.dependencies import get_cache, get_market_data_service, get_portfolio_service, get_quote_history_service
from src.core.application.use_cases.market_data_service import MarketDataService
from src.core.application.use_cases.portfolio_service import PortfolioApplicationService
from src.core.application.use_cases.quote_history_service import QuoteHistoryService
from src.infrastructure.cache import RedisCache

router = APIRouter()


def _quotes_response(svc: MarketDataService, symbols: List[str]) -> Dict[str, Dict[str, float]]:
    quotes = svc.get_quotes(symbols)
    out: Dict[str, Dict[str, float]] = {}
    for symbol in symbols:
        quote = quotes.get(symbol)
        if not quote:
            continue
        quote_dict: Dict[str, float] = {
            "price": quote.price,
            "change": quote.change,
            "changeRate": quote.change_rate,
            "timestamp": quote.timestamp,
        }
        if quote.volume is not None:
            quote_dict["volume"] = quote.volume
        out[symbol] = quote_dict
    return out


def register(r: APIRouter) -> None:
    @r.get("/health")
    def health_check():
        return {"status": "ok"}

    @r.get("/api/v1/portfolio")
    async def portfolio_get(
        svc: Annotated[PortfolioApplicationService, Depends(get_portfolio_service)],
        cache: Annotated[RedisCache, Depends(get_cache)] = None,
    ):
        cache_key = f"{PORTFOLIO_AGGREGATE_KEY_PREFIX}demo-portfolio"
        if cache:
            cached = await cache.get(cache_key)
            if cached is not None:
                return cached
        portfolio = await svc.get_portfolio()
        response = assemble_portfolio(portfolio)
        if cache:
            await cache.set(
                cache_key,
                response.model_dump(mode="json"),
                ttl_seconds=CACHE_TTL_SECONDS,
            )
        return response

    @r.get("/api/v1/quotes")
    def quotes_get(
        svc: Annotated[MarketDataService, Depends(get_market_data_service)],
        symbols: str = Query(...),
    ):
        requested = [s.strip().upper() for s in symbols.split(",") if s.strip()]
        return _quotes_response(svc, requested)

    @r.get("/api/v1/quotes/history")
    def quotes_history_get(
        svc: Annotated[QuoteHistoryService, Depends(get_quote_history_service)],
        symbols: str = Query(...),
        minutes: int = Query(5, ge=1, le=60),
    ):
        requested = [s.strip().upper() for s in symbols.split(",") if s.strip()]
        if not requested:
            return {}
        return svc.get_history(requested, minutes=minutes)

    @r.post("/api/v1/seed")
    async def portfolio_seed(
        payload: dict,
        svc: Annotated[PortfolioApplicationService, Depends(get_portfolio_service)],
        cache: Annotated[RedisCache, Depends(get_cache)] = None,
    ):
        ok = await svc.seed_portfolio(payload)
        if not ok:
            raise HTTPException(status_code=400, detail="Invalid portfolio payload")
        if cache:
            await cache.delete_by_prefix(PORTFOLIO_AGGREGATE_KEY_PREFIX)
        return {"ok": True}

    @r.websocket("/ws/quotes")
    async def websocket_quotes(
        websocket: WebSocket,
        svc: Annotated[MarketDataService, Depends(get_market_data_service)],
    ):
        await websocket.accept()
        subscribed: List[str] = []
        try:
            while True:
                message = await websocket.receive_json()
                msg_type = message.get("type")
                if msg_type in ("subscribe", "update"):
                    raw_symbols = message.get("symbols") or []
                    subscribed = [
                        str(s).strip().upper()
                        for s in raw_symbols
                        if str(s).strip()
                    ]
                    if not subscribed:
                        await websocket.send_json({"type": "snapshot", "quotes": {}})
                        continue
                    payload = _quotes_response(svc, subscribed)
                    await websocket.send_json({"type": "snapshot", "quotes": payload})
        except WebSocketDisconnect:
            return
        except Exception:
            return


register(router)
