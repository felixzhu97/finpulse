from __future__ import annotations

from dataclasses import dataclass
from typing import List

from src.core.domain.value_objects.portfolio import HistoryPoint, PortfolioSummary


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
class Portfolio:
  id: str
  owner_name: str
  base_currency: str
  accounts: List[Account]
  summary: PortfolioSummary
  history: List[HistoryPoint]
