from __future__ import annotations

from typing import Any, Optional

from src.core.application.ports.message_brokers.event_ports import IEventPublisherPort
from src.core.application.ports.repositories.portfolio_repository import IPortfolioRepository
from src.core.domain.entities.portfolio import Account, Holding, Portfolio
from src.core.domain.events import PortfolioEvent
from src.core.domain.value_objects.portfolio import HistoryPoint, PortfolioSummary


def _demo_portfolio() -> Portfolio:
  holdings_brokerage = [
    Holding("h-aapl", "AAPL", "Apple Inc.", 150, 190, 160, 28500, 4500, 0.1875, "equity", "medium"),
    Holding("h-msft", "MSFT", "Microsoft Corp.", 80, 420, 350, 33600, 5600, 0.2, "equity", "medium"),
  ]
  brokerage = Account("acc-brokerage-1", "Brokerage Account", "brokerage", "USD", 125000, 1200, holdings_brokerage)
  holdings_saving = [
    Holding("h-cash-usd", "CASH", "Cash", 30000, 1, 1, 30000, 0, 0, "cash", "low"),
  ]
  saving = Account("acc-saving-1", "High Yield Savings", "saving", "USD", 30000, 5, holdings_saving)
  credit = Account("acc-credit-1", "Credit Card", "creditCard", "USD", -3500, 0, [])
  summary = PortfolioSummary(155000, 3500, 151500, 1205, 3200)
  history = [
    HistoryPoint("2024-09-01", 140000),
    HistoryPoint("2024-09-02", 141200),
    HistoryPoint("2024-09-03", 139800),
    HistoryPoint("2024-09-04", 142000),
    HistoryPoint("2024-09-05", 143500),
    HistoryPoint("2024-09-06", 144200),
    HistoryPoint("2024-09-07", 145700),
  ]
  return Portfolio(
    id="demo-portfolio",
    owner_name="Demo User",
    base_currency="USD",
    accounts=[brokerage, saving, credit],
    summary=summary,
    history=history,
  )


def _portfolio_from_raw(raw: dict) -> Optional[Portfolio]:
  try:
    accounts = []
    for a in raw["accounts"]:
      holdings = [
        Holding(
          h["id"], h["symbol"], h["name"],
          float(h["quantity"]), float(h["price"]), float(h["costBasis"]),
          float(h["marketValue"]), float(h["profit"]), float(h["profitRate"]),
          h["assetClass"], h["riskLevel"],
        )
        for h in a["holdings"]
      ]
      accounts.append(Account(
        a["id"], a["name"], a["type"], a["currency"],
        float(a["balance"]), float(a["todayChange"]), holdings,
      ))
    summary = PortfolioSummary(
      float(raw["summary"]["totalAssets"]),
      float(raw["summary"]["totalLiabilities"]),
      float(raw["summary"]["netWorth"]),
      float(raw["summary"]["todayChange"]),
      float(raw["summary"]["weekChange"]),
    )
    history = [HistoryPoint(h["date"], float(h["value"])) for h in raw["history"]]
    return Portfolio(
      raw["id"], raw["ownerName"], raw["baseCurrency"],
      accounts, summary, history,
    )
  except (KeyError, TypeError):
    return None


class PortfolioApplicationService:
    def __init__(self, repository: IPortfolioRepository, event_publisher: IEventPublisherPort):
        self._repo = repository
        self._publisher = event_publisher

    async def get_portfolio(self, portfolio_id: str = "demo-portfolio") -> Portfolio:
        portfolio = await self._repo.get(portfolio_id)
        return portfolio if portfolio is not None else _demo_portfolio()

    async def seed_portfolio(self, payload: Any) -> bool:
        if not isinstance(payload, dict):
            return False
        if _portfolio_from_raw(payload) is None:
            return False
        portfolio_id = payload.get("id", "demo-portfolio")
        await self._repo.save(portfolio_id, payload)
        event = PortfolioEvent.create("portfolio.seeded", portfolio_id, payload)
        self._publisher.publish(event)
        return True
