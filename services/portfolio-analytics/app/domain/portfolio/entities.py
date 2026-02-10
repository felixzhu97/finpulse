from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import List
from uuid import UUID

from app.domain.portfolio.value_objects import HistoryPoint, PortfolioSummary


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


@dataclass
class PortfolioSchema:
    portfolio_id: UUID
    account_id: UUID
    name: str
    base_currency: str
    created_at: datetime


@dataclass
class Position:
    position_id: UUID
    portfolio_id: UUID
    instrument_id: UUID
    quantity: float
    cost_basis: float | None
    as_of_date: date
