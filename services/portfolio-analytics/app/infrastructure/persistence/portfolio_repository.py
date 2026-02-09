import json
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.portfolio import Portfolio, Account, Holding, PortfolioSummary, HistoryPoint
from app.domain.portfolio.repository import IPortfolioRepository, IPortfolioHistoryRepository
from app.models import PortfolioRow


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
  def __init__(self, session: AsyncSession, history_repo: Optional[IPortfolioHistoryRepository] = None):
    self._session = session
    self._history_repo = history_repo

  async def get(self, portfolio_id: str = "demo-portfolio") -> Optional[Portfolio]:
    result = await self._session.execute(
      select(PortfolioRow).where(PortfolioRow.id == portfolio_id)
    )
    row = result.scalar_one_or_none()
    if not row:
      return None
    try:
      raw = row.data if isinstance(row.data, dict) else json.loads(row.data)
      portfolio = _portfolio_from_raw(raw)
      if portfolio and self._history_repo is not None:
        ts_history = await self._history_repo.get_range(portfolio_id, days=90)
        if ts_history:
          portfolio = Portfolio(
            portfolio.id,
            portfolio.owner_name,
            portfolio.base_currency,
            portfolio.accounts,
            portfolio.summary,
            ts_history,
          )
      return portfolio
    except (json.JSONDecodeError, TypeError):
      return None

  async def save(self, portfolio_id: str, data: dict) -> None:
    from sqlalchemy.dialects.postgresql import insert
    stmt = insert(PortfolioRow).values(id=portfolio_id, data=data).on_conflict_do_update(
      index_elements=["id"],
      set_={"data": data},
    )
    await self._session.execute(stmt)
    if self._history_repo is not None and isinstance(data.get("history"), list):
      points = [
        HistoryPoint(str(h["date"]), float(h["value"]))
        for h in data["history"]
        if isinstance(h.get("date"), str) and isinstance(h.get("value"), (int, float))
      ]
      if points:
        await self._history_repo.append(portfolio_id, points)
