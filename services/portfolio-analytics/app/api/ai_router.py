from fastapi import APIRouter

from app.ai import compute_var, score_fraud_anomaly, score_trade_anomaly, score_sentiment, score_identity
from app.api.ai_dto import (
  VarRequest,
  FraudCheckRequest,
  SurveillanceRequest,
  SentimentRequest,
  IdentityCheckRequest,
)

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])


@router.post("/risk/var")
def post_var(req: VarRequest):
  return compute_var(
    returns=req.returns,
    confidence=req.confidence,
    method=req.method,
  )


@router.post("/fraud/check")
def post_fraud_check(req: FraudCheckRequest):
  return score_fraud_anomaly(
    amount=req.amount,
    amount_currency=req.amount_currency,
    hour_of_day=req.hour_of_day,
    day_of_week=req.day_of_week,
    recent_count_24h=req.recent_count_24h,
    reference_samples=req.reference_samples,
  )


@router.post("/surveillance/trade")
def post_surveillance(req: SurveillanceRequest):
  return score_trade_anomaly(
    quantity=req.quantity,
    notional=req.notional,
    side=req.side,
    recent_quantities=req.recent_quantities,
    recent_notionals=req.recent_notionals,
  )


@router.post("/sentiment")
def post_sentiment(req: SentimentRequest):
  return score_sentiment(req.text)


@router.post("/identity/score")
def post_identity_score(req: IdentityCheckRequest):
  return score_identity(
    document_type=req.document_type,
    name_on_document=req.name_on_document,
    date_of_birth=req.date_of_birth,
    id_number=req.id_number,
  )
