from app.application.analytics_service import AnalyticsApplicationService
from app.application.market_data_service import MarketDataService
from app.infrastructure.analytics import (
    FraudDetectorProvider,
    ForecastProvider,
    IdentityProvider,
    RiskVarProvider,
    SentimentProvider,
    SummarisationProvider,
    SurveillanceProvider,
)
from app.infrastructure.analytics.huggingface_adapter import HfSummariseAdapter
from app.infrastructure.analytics.ollama_adapter import OllamaGenerateAdapter
from app.infrastructure.analytics.tf_forecast_adapter import TfForecastAdapter
from app.infrastructure.market_data.kafka_provider import KafkaMarketDataProvider


def market_data_service() -> MarketDataService:
    provider = KafkaMarketDataProvider()
    return MarketDataService(provider=provider)


def analytics_service() -> AnalyticsApplicationService:
    return AnalyticsApplicationService(
        risk_var=RiskVarProvider(),
        fraud=FraudDetectorProvider(),
        surveillance=SurveillanceProvider(),
        sentiment=SentimentProvider(),
        identity=IdentityProvider(),
        forecast_provider=ForecastProvider(),
        summarisation=SummarisationProvider(),
        ollama_generate=OllamaGenerateAdapter(),
        hf_summarise=HfSummariseAdapter(),
        tf_forecast=TfForecastAdapter(),
    )
