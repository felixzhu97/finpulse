from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.mappers import map_portfolio
from app.application.services import get_demo_portfolio

app = FastAPI(title="Portfolio Analytics API")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.get("/api/v1/portfolio")
def get_portfolio():
  portfolio = get_demo_portfolio()
  return map_portfolio(portfolio)

