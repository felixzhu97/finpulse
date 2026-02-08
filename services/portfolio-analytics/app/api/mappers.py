from app.api.dto import (
  AccountDto,
  HoldingDto,
  HistoryPointDto,
  PortfolioDto,
  PortfolioSummaryDto,
)
from app.domain.portfolio import Account, Holding, HistoryPoint, Portfolio, PortfolioSummary


def map_holding(h: Holding) -> HoldingDto:
  return HoldingDto(
    id=h.id,
    symbol=h.symbol,
    name=h.name,
    quantity=h.quantity,
    price=h.price,
    costBasis=h.cost_basis,
    marketValue=h.market_value,
    profit=h.profit,
    profitRate=h.profit_rate,
    assetClass=h.asset_class,
    riskLevel=h.risk_level,
  )


def map_account(a: Account) -> AccountDto:
  return AccountDto(
    id=a.id,
    name=a.name,
    type=a.type,
    currency=a.currency,
    balance=a.balance,
    todayChange=a.today_change,
    holdings=[map_holding(h) for h in a.holdings],
  )


def map_summary(s: PortfolioSummary) -> PortfolioSummaryDto:
  return PortfolioSummaryDto(
    totalAssets=s.total_assets,
    totalLiabilities=s.total_liabilities,
    netWorth=s.net_worth,
    todayChange=s.today_change,
    weekChange=s.week_change,
  )


def map_history_point(p: HistoryPoint) -> HistoryPointDto:
  return HistoryPointDto(date=p.date, value=p.value)


def map_portfolio(p: Portfolio) -> PortfolioDto:
  return PortfolioDto(
    id=p.id,
    ownerName=p.owner_name,
    baseCurrency=p.base_currency,
    accounts=[map_account(a) for a in p.accounts],
    summary=map_summary(p.summary),
    history=[map_history_point(h) for h in p.history],
  )

