from src.core.application.use_cases.analytics_service import AnalyticsApplicationService
from src.core.application.use_cases.market_data_service import MarketDataService
from src.infrastructure.external_services.analytics import (
    FraudDetectorProvider,
    ForecastProvider,
    IdentityProvider,
    RiskVarProvider,
    SentimentProvider,
    SummarisationProvider,
    SurveillanceProvider,
)
from src.infrastructure.external_services.analytics.huggingface_adapter import HfSummariseAdapter
from src.infrastructure.external_services.analytics.ollama_adapter import OllamaGenerateAdapter
from src.infrastructure.external_services.analytics.tf_forecast_adapter import TfForecastAdapter
from src.infrastructure.external_services.market_data.kafka_provider import KafkaMarketDataProvider


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
