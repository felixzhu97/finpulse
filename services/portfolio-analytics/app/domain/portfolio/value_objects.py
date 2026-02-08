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
