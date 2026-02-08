from fastapi import APIRouter

from app.container import analytics_service
from app.api.ai_dto import (
  VarRequest,
  FraudCheckRequest,
  SurveillanceRequest,
  SentimentRequest,
  IdentityCheckRequest,
  DlForecastRequest,
  LlmSummariseRequest,
  OllamaGenerateRequest,
  HfSummariseRequest,
  TfForecastRequest,
)

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])


def _analytics():
  return analytics_service()


@router.post("/risk/var")
def post_var(req: VarRequest):
  return _analytics().compute_var(
    returns=req.returns,
    confidence=req.confidence,
    method=req.method,
    portfolio_id=req.portfolio_id,
  )


@router.post("/fraud/check")
def post_fraud_check(req: FraudCheckRequest):
  return _analytics().check_fraud(
    amount=req.amount,
    amount_currency=req.amount_currency,
    hour_of_day=req.hour_of_day,
    day_of_week=req.day_of_week,
    recent_count_24h=req.recent_count_24h,
    reference_samples=req.reference_samples,
  )


@router.post("/surveillance/trade")
def post_surveillance(req: SurveillanceRequest):
  return _analytics().score_trade_surveillance(
    quantity=req.quantity,
    notional=req.notional,
    side=req.side,
    recent_quantities=req.recent_quantities,
    recent_notionals=req.recent_notionals,
    instrument_id=req.instrument_id,
  )


@router.post("/sentiment")
def post_sentiment(req: SentimentRequest):
  return _analytics().score_sentiment(req.text)


@router.post("/identity/score")
def post_identity_score(req: IdentityCheckRequest):
  return _analytics().score_identity(
    document_type=req.document_type,
    name_on_document=req.name_on_document,
    date_of_birth=req.date_of_birth,
    id_number=req.id_number,
    country_iso=req.country_iso,
  )


@router.post("/dl/forecast")
def post_dl_forecast(req: DlForecastRequest):
  return _analytics().forecast(values=req.values, horizon=req.horizon)


@router.post("/llm/summarise")
def post_llm_summarise(req: LlmSummariseRequest):
  return _analytics().summarise(text=req.text, max_sentences=req.max_sentences)


@router.post("/ollama/generate")
def post_ollama_generate(req: OllamaGenerateRequest):
  return _analytics().ollama_generate(prompt=req.prompt, model=req.model)


@router.post("/huggingface/summarise")
def post_huggingface_summarise(req: HfSummariseRequest):
  return _analytics().hf_summarise(
    text=req.text,
    max_length=req.max_length,
    min_length=req.min_length,
  )


@router.post("/tf/forecast")
def post_tf_forecast(req: TfForecastRequest):
  return _analytics().tf_forecast(
    values=req.values,
    horizon=req.horizon,
    lookback=req.lookback,
  )
