from dataclasses import dataclass
from typing import List


@dataclass
class Holding:
  id: str
  symbol: str
  name: str
  quantity: float
  price: float
  cost_basis: float
  market_value: float
  profit: float
  profit_rate: float
  asset_class: str
  risk_level: str


@dataclass
class Account:
  id: str
  name: str
  type: str
  currency: str
  balance: float
  today_change: float
  holdings: List[Holding]


@dataclass
class PortfolioSummary:
  total_assets: float
  total_liabilities: float
  net_worth: float
  today_change: float
  week_change: float


@dataclass
class HistoryPoint:
  date: str
  value: float


@dataclass
class Portfolio:
  id: str
  owner_name: str
  base_currency: str
  accounts: List[Account]
  summary: PortfolioSummary
  history: List[HistoryPoint]

