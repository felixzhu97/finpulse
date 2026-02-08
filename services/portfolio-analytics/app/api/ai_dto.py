from typing import List, Optional

from pydantic import BaseModel, Field


class VarRequest(BaseModel):
  returns: List[float] = Field(
    default_factory=list,
    description="Daily or period log returns for the portfolio or position (e.g. -0.01 for -1%).",
  )
  confidence: float = Field(default=0.95, ge=0.5, le=1.0, description="VaR confidence level (e.g. 0.95 for 95%).")
  method: str = Field(default="historical", pattern="^(historical|parametric)$")
  portfolio_id: Optional[str] = Field(default=None, description="Optional portfolio or position identifier for reporting.")


class FraudCheckRequest(BaseModel):
  amount: float = Field(gt=0, description="Transaction amount in settlement currency.")
  amount_currency: str = Field(default="USD", description="ISO 4217 currency code.")
  hour_of_day: int = Field(ge=0, le=23)
  day_of_week: int = Field(ge=0, le=6)
  recent_count_24h: int = Field(ge=0, description="Number of transactions by same actor in last 24 hours.")
  reference_samples: Optional[List[List[float]]] = None
  transaction_type: Optional[str] = Field(default=None, description="E.g. wire, card, internal_transfer.")


class SurveillanceRequest(BaseModel):
  quantity: float = Field(gt=0, description="Order or fill quantity (shares/units).")
  notional: float = Field(gt=0, description="Order or fill notional in settlement currency.")
  side: str = Field(pattern="^(buy|sell)$")
  recent_quantities: List[float] = Field(default_factory=list, description="Recent order quantities for same instrument/actor.")
  recent_notionals: List[float] = Field(default_factory=list)
  instrument_id: Optional[str] = Field(default=None, description="Symbol or instrument identifier for reporting.")


class SentimentRequest(BaseModel):
  text: str = Field(min_length=1, description="Market news, research snippet, or social text.")
  source: Optional[str] = Field(default=None, description="E.g. news, research, earnings_call, social.")


class IdentityCheckRequest(BaseModel):
  document_type: str = Field(min_length=1, description="E.g. passport, id_card, drivers_license.")
  name_on_document: str = Field(min_length=1)
  date_of_birth: Optional[str] = None
  id_number: Optional[str] = None
  country_iso: Optional[str] = Field(default=None, description="ISO 3166-1 alpha-2 country code.")


class DlForecastRequest(BaseModel):
  values: List[float] = Field(default_factory=list, min_length=2, description="Time series e.g. NAV, price, or return index.")
  horizon: int = Field(default=1, ge=1, le=252, description="Forecast horizon (e.g. business days).")
  series_type: Optional[str] = Field(default=None, description="E.g. nav, price, return for interpretation.")


class LlmSummariseRequest(BaseModel):
  text: str = Field(min_length=1, description="Report or document excerpt (e.g. regulatory, risk, earnings).")
  max_sentences: int = Field(default=3, ge=1, le=10)
  report_type: Optional[str] = Field(default=None, description="E.g. regulatory, risk_report, earnings.")


class OllamaGenerateRequest(BaseModel):
  prompt: str = Field(min_length=1, description="E.g. compliance Q&A, report summary instruction.")
  model: Optional[str] = None


class HfSummariseRequest(BaseModel):
  text: str = Field(min_length=1, description="Long-form report or document excerpt.")
  max_length: int = Field(default=150, ge=30, le=512)
  min_length: int = Field(default=30, ge=10, le=256)


class TfForecastRequest(BaseModel):
  values: List[float] = Field(default_factory=list, min_length=6, description="Price or risk series for forecasting.")
  horizon: int = Field(default=1, ge=1, le=12)
  lookback: int = Field(default=5, ge=2, le=20)
