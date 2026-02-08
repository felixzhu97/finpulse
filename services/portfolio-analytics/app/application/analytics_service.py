from typing import List, Optional

from app.infrastructure.analytics import (
  RiskVarProvider,
  FraudDetectorProvider,
  SurveillanceProvider,
  SentimentProvider,
  IdentityProvider,
  ForecastProvider,
  SummarisationProvider,
)
from app.infrastructure.analytics.ollama_client import generate as ollama_generate
from app.infrastructure.analytics.huggingface_client import summarise as hf_summarise
from app.infrastructure.analytics.tf_forecast_provider import forecast as tf_forecast


class AnalyticsApplicationService:
  def __init__(
    self,
    risk_var: RiskVarProvider,
    fraud: FraudDetectorProvider,
    surveillance: SurveillanceProvider,
    sentiment: SentimentProvider,
    identity: IdentityProvider,
    forecast_provider: ForecastProvider,
    summarisation: SummarisationProvider,
  ):
    self._risk_var = risk_var
    self._fraud = fraud
    self._surveillance = surveillance
    self._sentiment = sentiment
    self._identity = identity
    self._forecast = forecast_provider
    self._summarisation = summarisation

  def compute_var(
    self,
    returns: List[float],
    confidence: float = 0.95,
    method: str = "historical",
    portfolio_id: Optional[str] = None,
  ) -> dict:
    out = self._risk_var.compute(returns=returns, confidence=confidence, method=method)
    if portfolio_id is not None:
      out["portfolio_id"] = portfolio_id
    return out

  def check_fraud(
    self,
    amount: float,
    amount_currency: str,
    hour_of_day: int,
    day_of_week: int,
    recent_count_24h: int,
    reference_samples: Optional[List[List[float]]] = None,
  ) -> dict:
    return self._fraud.score(
      amount=amount,
      amount_currency=amount_currency,
      hour_of_day=hour_of_day,
      day_of_week=day_of_week,
      recent_count_24h=recent_count_24h,
      reference_samples=reference_samples,
    )

  def score_trade_surveillance(
    self,
    quantity: float,
    notional: float,
    side: str,
    recent_quantities: List[float],
    recent_notionals: List[float],
    instrument_id: Optional[str] = None,
  ) -> dict:
    out = self._surveillance.score_trade(
      quantity=quantity,
      notional=notional,
      side=side,
      recent_quantities=recent_quantities,
      recent_notionals=recent_notionals,
    )
    if instrument_id is not None:
      out["instrument_id"] = instrument_id
    return out

  def score_sentiment(self, text: str) -> dict:
    return self._sentiment.score(text)

  def score_identity(
    self,
    document_type: str,
    name_on_document: str,
    date_of_birth: Optional[str] = None,
    id_number: Optional[str] = None,
    country_iso: Optional[str] = None,
  ) -> dict:
    out = self._identity.score(
      document_type=document_type,
      name_on_document=name_on_document,
      date_of_birth=date_of_birth,
      id_number=id_number,
    )
    if country_iso is not None:
      out["country_iso"] = country_iso
    return out

  def forecast(self, values: List[float], horizon: int = 1) -> dict:
    return self._forecast.forecast(values=values, horizon=horizon)

  def summarise(self, text: str, max_sentences: int = 3) -> dict:
    return self._summarisation.summarise(text=text, max_sentences=max_sentences)

  def ollama_generate(self, prompt: str, model: Optional[str] = None) -> dict:
    try:
      return ollama_generate(prompt=prompt, model=model)
    except Exception as e:
      return {"response": "", "model": model or "llama2", "error": str(e)}

  def hf_summarise(self, text: str, max_length: int = 150, min_length: int = 30) -> dict:
    try:
      return hf_summarise(text=text, max_length=max_length, min_length=min_length)
    except Exception as e:
      return {"summary": "", "model": "", "error": str(e)}

  def tf_forecast(self, values: List[float], horizon: int = 1, lookback: int = 5) -> dict:
    try:
      return tf_forecast(values=values, horizon=horizon, lookback=lookback)
    except Exception as e:
      return {"forecast": [], "horizon": horizon, "provider": "tensorflow", "error": str(e)}
