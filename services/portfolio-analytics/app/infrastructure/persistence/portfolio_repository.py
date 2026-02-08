import json
from typing import Optional

from app.domain.portfolio import Portfolio, Account, Holding, PortfolioSummary, HistoryPoint
from app.domain.portfolio.repository import IPortfolioRepository
from app import db


def _portfolio_from_raw(raw: dict) -> Optional[Portfolio]:
  try:
    accounts = []
    for a in raw["accounts"]:
      holdings = [
        Holding(
          id=h["id"],
          symbol=h["symbol"],
          name=h["name"],
          quantity=float(h["quantity"]),
          price=float(h["price"]),
          cost_basis=float(h["costBasis"]),
          market_value=float(h["marketValue"]),
          profit=float(h["profit"]),
          profit_rate=float(h["profitRate"]),
          asset_class=h["assetClass"],
          risk_level=h["riskLevel"],
        )
        for h in a["holdings"]
      ]
      accounts.append(
        Account(
          id=a["id"],
          name=a["name"],
          type=a["type"],
          currency=a["currency"],
          balance=float(a["balance"]),
          today_change=float(a["todayChange"]),
          holdings=holdings,
        )
      )
    summary = PortfolioSummary(
      total_assets=float(raw["summary"]["totalAssets"]),
      total_liabilities=float(raw["summary"]["totalLiabilities"]),
      net_worth=float(raw["summary"]["netWorth"]),
      today_change=float(raw["summary"]["todayChange"]),
      week_change=float(raw["summary"]["weekChange"]),
    )
    history = [HistoryPoint(h["date"], float(h["value"])) for h in raw["history"]]
    return Portfolio(
      id=raw["id"],
      owner_name=raw["ownerName"],
      base_currency=raw["baseCurrency"],
      accounts=accounts,
      summary=summary,
      history=history,
    )
  except (KeyError, TypeError):
    return None


class PortfolioRepository(IPortfolioRepository):
  def get(self, portfolio_id: str = "demo-portfolio") -> Optional[Portfolio]:
    data = db.load_portfolio_json(portfolio_id)
    if not data:
      return None
    try:
      raw = json.loads(data)
      return _portfolio_from_raw(raw)
    except (json.JSONDecodeError, TypeError):
      return None

  def save(self, portfolio_id: str, data: dict) -> None:
    db.save_portfolio_json(portfolio_id, data)
