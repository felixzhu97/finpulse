from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.analytics_requests import (
    DlForecastRequest,
    FraudCheckRequest,
    HfSummariseRequest,
    IdentityCheckRequest,
    LlmSummariseRequest,
    OllamaGenerateRequest,
    SentimentRequest,
    SurveillanceRequest,
    TfForecastRequest,
    VarRequest,
)
from app.application.analytics_service import AnalyticsApplicationService
from app.dependencies import get_analytics_service

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])


@router.post("/risk/var")
def post_var(
    req: VarRequest,
    svc: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)],
):
    return svc.compute_var(
        returns=req.returns,
        confidence=req.confidence,
        method=req.method,
        portfolio_id=req.portfolio_id,
    )


@router.post("/fraud/check")
def post_fraud_check(
    req: FraudCheckRequest,
    svc: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)],
):
    return svc.check_fraud(
        amount=req.amount,
        amount_currency=req.amount_currency,
        hour_of_day=req.hour_of_day,
        day_of_week=req.day_of_week,
        recent_count_24h=req.recent_count_24h,
        reference_samples=req.reference_samples,
    )


@router.post("/surveillance/trade")
def post_surveillance(
    req: SurveillanceRequest,
    svc: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)],
):
    return svc.score_trade_surveillance(
        quantity=req.quantity,
        notional=req.notional,
        side=req.side,
        recent_quantities=req.recent_quantities,
        recent_notionals=req.recent_notionals,
        instrument_id=req.instrument_id,
    )


@router.post("/sentiment")
def post_sentiment(
    req: SentimentRequest,
    svc: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)],
):
    return svc.score_sentiment(req.text)


@router.post("/identity/score")
def post_identity_score(
    req: IdentityCheckRequest,
    svc: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)],
):
    return svc.score_identity(
        document_type=req.document_type,
        name_on_document=req.name_on_document,
        date_of_birth=req.date_of_birth,
        id_number=req.id_number,
        country_iso=req.country_iso,
    )


@router.post("/dl/forecast")
def post_dl_forecast(
    req: DlForecastRequest,
    svc: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)],
):
    return svc.forecast(values=req.values, horizon=req.horizon)


@router.post("/llm/summarise")
def post_llm_summarise(
    req: LlmSummariseRequest,
    svc: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)],
):
    return svc.summarise(text=req.text, max_sentences=req.max_sentences)


@router.post("/ollama/generate")
def post_ollama_generate(
    req: OllamaGenerateRequest,
    svc: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)],
):
    return svc.ollama_generate(prompt=req.prompt, model=req.model)


@router.post("/huggingface/summarise")
def post_huggingface_summarise(
    req: HfSummariseRequest,
    svc: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)],
):
    return svc.hf_summarise(
        text=req.text,
        max_length=req.max_length,
        min_length=req.min_length,
    )


@router.post("/tf/forecast")
def post_tf_forecast(
    req: TfForecastRequest,
    svc: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)],
):
    return svc.tf_forecast(
        values=req.values,
        horizon=req.horizon,
        lookback=req.lookback,
    )
