from dataclasses import dataclass
from typing import List, Optional


@dataclass(frozen=True)
class VarResult:
  var: float
  var_percent: float
  method: str
  confidence: float
  mean_return: float
  volatility: float
  interpretation: str


@dataclass(frozen=True)
class FraudCheckResult:
  is_anomaly: bool
  anomaly_score: float
  recommendation: str
  amount: float
  amount_currency: str


@dataclass(frozen=True)
class SurveillanceResult:
  is_anomaly: bool
  alert_type: str
  quantity_zscore: float
  notional_zscore: float
  quantity: float
  notional: float
  side: str


@dataclass(frozen=True)
class SentimentResult:
  compound: float
  negative: float
  neutral: float
  positive: float
  label: str
  market_sentiment: str


@dataclass(frozen=True)
class IdentityResult:
  identity_score: float
  kyc_tier: str
  checks: List[str]
  document_type: str


@dataclass(frozen=True)
class ForecastResult:
  forecast: List[float]
  horizon: int
  provider: Optional[str] = None


@dataclass(frozen=True)
class SummarisationResult:
  summary: str
  max_sentences: Optional[int] = None
  model: Optional[str] = None
