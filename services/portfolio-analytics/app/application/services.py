from typing import List

from app.domain.models import (
  Account,
  Holding,
  HistoryPoint,
  Portfolio,
  PortfolioSummary,
)


def get_demo_portfolio() -> Portfolio:
  accounts: List[Account] = []

  holdings_brokerage: List[Holding] = [
    Holding(
      id="h-aapl",
      symbol="AAPL",
      name="Apple Inc.",
      quantity=150,
      price=190,
      cost_basis=160,
      market_value=150 * 190,
      profit=150 * (190 - 160),
      profit_rate=(190 - 160) / 160,
      asset_class="equity",
      risk_level="medium",
    ),
    Holding(
      id="h-msft",
      symbol="MSFT",
      name="Microsoft Corp.",
      quantity=80,
      price=420,
      cost_basis=350,
      market_value=80 * 420,
      profit=80 * (420 - 350),
      profit_rate=(420 - 350) / 350,
      asset_class="equity",
      risk_level="medium",
    ),
  ]

  brokerage = Account(
    id="acc-brokerage-1",
    name="Brokerage Account",
    type="brokerage",
    currency="USD",
    balance=125000,
    today_change=1200,
    holdings=holdings_brokerage,
  )
  accounts.append(brokerage)

  holdings_saving = [
    Holding(
      id="h-cash-usd",
      symbol="CASH",
      name="Cash",
      quantity=30000,
      price=1,
      cost_basis=1,
      market_value=30000,
      profit=0,
      profit_rate=0,
      asset_class="cash",
      risk_level="low",
    )
  ]

  saving = Account(
    id="acc-saving-1",
    name="High Yield Savings",
    type="saving",
    currency="USD",
    balance=30000,
    today_change=5,
    holdings=holdings_saving,
  )
  accounts.append(saving)

  credit = Account(
    id="acc-credit-1",
    name="Credit Card",
    type="creditCard",
    currency="USD",
    balance=-3500,
    today_change=0,
    holdings=[],
  )
  accounts.append(credit)

  summary = PortfolioSummary(
    total_assets=125000 + 30000,
    total_liabilities=3500,
    net_worth=125000 + 30000 - 3500,
    today_change=1200 + 5,
    week_change=3200,
  )

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
    accounts=accounts,
    summary=summary,
    history=history,
  )

