from contextlib import asynccontextmanager
from typing import Annotated, Dict, List

from fastapi import Depends, FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.mappers import map_portfolio
from app.api.ai_router import router as ai_router
from app.application.portfolio_service import PortfolioApplicationService
from app.container import market_data_service
from app.dependencies import get_portfolio_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from alembic import command
        from alembic.config import Config
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
    except Exception:
        pass
    yield


app = FastAPI(title="Portfolio Analytics API", lifespan=lifespan)
app.include_router(ai_router)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.get("/api/v1/portfolio")
async def portfolio_get(
  svc: Annotated[PortfolioApplicationService, Depends(get_portfolio_service)],
):
  portfolio = await svc.get_portfolio()
  return map_portfolio(portfolio)


@app.get("/api/v1/quotes")
def quotes_get(symbols: str = Query(...)):
  svc = market_data_service()
  requested: List[str] = [
    s.strip().upper() for s in symbols.split(",") if s.strip()
  ]
  quotes = svc.get_quotes(requested)
  response: Dict[str, Dict[str, float]] = {}
  for symbol in requested:
    quote = quotes.get(symbol)
    if not quote:
      continue
    response[symbol] = {
      "price": quote.price,
      "change": quote.change,
      "changeRate": quote.change_rate,
      "timestamp": quote.timestamp,
    }
  return response


@app.post("/api/v1/seed")
async def portfolio_seed(
  payload: dict,
  svc: Annotated[PortfolioApplicationService, Depends(get_portfolio_service)],
):
  ok = await svc.seed_portfolio(payload)
  if not ok:
    raise HTTPException(status_code=400, detail="Invalid portfolio payload")
  return {"ok": True}


@app.websocket("/ws/quotes")
async def websocket_quotes(websocket: WebSocket):
  await websocket.accept()
  svc = market_data_service()
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
        quotes = svc.get_quotes(subscribed)
        payload: Dict[str, Dict[str, float]] = {}
        for symbol in subscribed:
          quote = quotes.get(symbol)
          if not quote:
            continue
          payload[symbol] = {
            "price": quote.price,
            "change": quote.change,
            "changeRate": quote.change_rate,
            "timestamp": quote.timestamp,
          }
        await websocket.send_json(
          {
            "type": "snapshot",
            "quotes": payload,
          }
        )
  except WebSocketDisconnect:
    return

