from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api.mappers import map_portfolio
from app.application.services import get_portfolio, seed_portfolio

app = FastAPI(title="Portfolio Analytics API")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.get("/api/v1/portfolio")
def portfolio_get():
  portfolio = get_portfolio()
  return map_portfolio(portfolio)


@app.post("/api/v1/seed")
def portfolio_seed(payload: dict):
  if not seed_portfolio(payload):
    raise HTTPException(status_code=400, detail="Invalid portfolio payload")
  return {"ok": True}

