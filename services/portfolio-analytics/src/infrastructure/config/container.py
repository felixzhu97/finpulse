from src.core.application.use_cases.analytics_service import AnalyticsApplicationService
from src.core.application.use_cases.market_data_service import MarketDataService
from src.core.application.use_cases.quote_history_service import QuoteHistoryService
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
from src.infrastructure.cache.quote_cache import QuoteCache
from src.infrastructure.external_services.market_data.cached_provider import CachedMarketDataProvider
from src.infrastructure.external_services.market_data.database_provider import DatabaseMarketDataProvider


def market_data_service(quote_repo) -> MarketDataService:
    provider = CachedMarketDataProvider(
        inner=DatabaseMarketDataProvider(repository=quote_repo),
        cache=QuoteCache(),
    )
    return MarketDataService(provider=provider)


def quote_history_service(quote_repo) -> QuoteHistoryService:
    return QuoteHistoryService(repository=quote_repo)


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
