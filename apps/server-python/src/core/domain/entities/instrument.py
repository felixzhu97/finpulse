from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class Instrument:
    instrument_id: UUID
    symbol: str
    name: str | None
    asset_class: str | None
    currency: str | None
    exchange: str | None


@dataclass
class Bond:
    bond_id: UUID
    instrument_id: UUID
    face_value: float | None
    coupon_rate: float | None
    ytm: float | None
    duration: float | None
    convexity: float | None
    maturity_years: float | None
    frequency: int | None


@dataclass
class Option:
    option_id: UUID
    instrument_id: UUID
    underlying_instrument_id: UUID
    strike: float
    expiry: datetime
    option_type: str
    risk_free_rate: float | None
    volatility: float | None
    bs_price: float | None
    delta: float | None
    gamma: float | None
    theta: float | None
    vega: float | None
    rho: float | None
    implied_volatility: float | None
