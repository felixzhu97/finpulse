from typing import Annotated, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect

from app.api.portfolio_assembler import assemble_portfolio
from app.application.market_data_service import MarketDataService
from app.application.portfolio_service import PortfolioApplicationService
from app.dependencies import get_market_data_service, get_portfolio_service

router = APIRouter()


def _quotes_response(svc: MarketDataService, symbols: List[str]) -> Dict[str, Dict[str, float]]:
    quotes = svc.get_quotes(symbols)
    out: Dict[str, Dict[str, float]] = {}
    for symbol in symbols:
        quote = quotes.get(symbol)
        if not quote:
            continue
        out[symbol] = {
            "price": quote.price,
            "change": quote.change,
            "changeRate": quote.change_rate,
            "timestamp": quote.timestamp,
        }
    return out


def register(r: APIRouter) -> None:
    @r.get("/api/v1/portfolio")
    async def portfolio_get(
        svc: Annotated[PortfolioApplicationService, Depends(get_portfolio_service)],
    ):
        portfolio = await svc.get_portfolio()
        return assemble_portfolio(portfolio)

    @r.get("/api/v1/quotes")
    def quotes_get(
        svc: Annotated[MarketDataService, Depends(get_market_data_service)],
        symbols: str = Query(...),
    ):
        requested = [s.strip().upper() for s in symbols.split(",") if s.strip()]
        return _quotes_response(svc, requested)

    @r.post("/api/v1/seed")
    async def portfolio_seed(
        payload: dict,
        svc: Annotated[PortfolioApplicationService, Depends(get_portfolio_service)],
    ):
        ok = await svc.seed_portfolio(payload)
        if not ok:
            raise HTTPException(status_code=400, detail="Invalid portfolio payload")
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


register(router)
