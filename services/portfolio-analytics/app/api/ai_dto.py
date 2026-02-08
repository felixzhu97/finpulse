from typing import List, Optional

from pydantic import BaseModel, Field


class VarRequest(BaseModel):
  returns: List[float] = Field(default_factory=list)
  confidence: float = Field(default=0.95, ge=0.5, le=1.0)
  method: str = Field(default="historical", pattern="^(historical|parametric)$")


class FraudCheckRequest(BaseModel):
  amount: float = Field(gt=0)
  amount_currency: str = "USD"
  hour_of_day: int = Field(ge=0, le=23)
  day_of_week: int = Field(ge=0, le=6)
  recent_count_24h: int = Field(ge=0)
  reference_samples: Optional[List[List[float]]] = None


class SurveillanceRequest(BaseModel):
  quantity: float = Field(gt=0)
  notional: float = Field(gt=0)
  side: str = Field(pattern="^(buy|sell)$")
  recent_quantities: List[float] = Field(default_factory=list)
  recent_notionals: List[float] = Field(default_factory=list)


class SentimentRequest(BaseModel):
  text: str = Field(min_length=1)


class IdentityCheckRequest(BaseModel):
  document_type: str = Field(min_length=1)
  name_on_document: str = Field(min_length=1)
  date_of_birth: Optional[str] = None
  id_number: Optional[str] = None
