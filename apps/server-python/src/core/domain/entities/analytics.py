from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from uuid import UUID


@dataclass
class RiskMetrics:
    metric_id: UUID
    portfolio_id: UUID
    as_of_date: date
    risk_level: str | None
    volatility: float | None
    sharpe_ratio: float | None
    var: float | None
    beta: float | None


@dataclass
class Valuation:
    valuation_id: UUID
    instrument_id: UUID
    as_of_date: date
    method: str | None
    ev: float | None
    equity_value: float | None
    target_price: float | None
    multiples: float | None
    discount_rate: float | None
    growth_rate: float | None
