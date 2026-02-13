from dataclasses import dataclass


@dataclass(frozen=True)
class PortfolioSummary:
  total_assets: float
  total_liabilities: float
  net_worth: float
  today_change: float
  week_change: float


@dataclass(frozen=True)
class HistoryPoint:
  date: str
  value: float


@dataclass(frozen=True)
class RiskSummary:
  high_ratio: float
  top_holdings_concentration: float


@dataclass(frozen=True)
class AssetAllocationItem:
  type: str
  value: float
