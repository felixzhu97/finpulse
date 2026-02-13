from src.core.application.use_cases.analytics_service import AnalyticsApplicationService
from src.core.application.use_cases.blockchain_service import BlockchainApplicationService
from src.core.application.use_cases.market_data_service import MarketDataService
from src.core.application.use_cases.portfolio_service import PortfolioApplicationService
from src.core.application.use_cases.quote_history_service import QuoteHistoryService
from src.infrastructure.database.repositories import (
    PortfolioHistoryRepository,
    PortfolioRepository,
    blockchain_ledger_repo,
    wallet_balance_repo,
)
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
from src.infrastructure.external_services.analytics.pyspark_batch_var_adapter import PySparkBatchRiskVarAdapter
from src.infrastructure.cache.quote_cache import QuoteCache
from src.infrastructure.external_services.market_data.cached_provider import CachedMarketDataProvider
from src.infrastructure.external_services.market_data.database_provider import DatabaseMarketDataProvider
from src.infrastructure.message_brokers import EventPublisher
from src.infrastructure.database.repositories.realtime_quote_repository import RealtimeQuoteRepository


def portfolio_service(session, redis_client) -> PortfolioApplicationService:
    history_repo = PortfolioHistoryRepository(session, redis_client=redis_client)
    portfolio_repo = PortfolioRepository(session, history_repo=history_repo)
    return PortfolioApplicationService(
        repository=portfolio_repo,
        event_publisher=EventPublisher(),
    )


def blockchain_service(session) -> BlockchainApplicationService:
    return BlockchainApplicationService(
        ledger=blockchain_ledger_repo(session),
        wallet_repository=wallet_balance_repo(session),
    )


def portfolio_history_repo(session, redis_client) -> PortfolioHistoryRepository:
    return PortfolioHistoryRepository(session, redis_client=redis_client)


def market_data_service(quote_repo) -> MarketDataService:
    provider = CachedMarketDataProvider(
        inner=DatabaseMarketDataProvider(repository=quote_repo),
        cache=QuoteCache(),
    )
    return MarketDataService(provider=provider)


def quote_history_service(quote_repo=None) -> QuoteHistoryService:
    repo = quote_repo or RealtimeQuoteRepository()
    return QuoteHistoryService(repository=repo)


def analytics_service() -> AnalyticsApplicationService:
    risk_var = RiskVarProvider()
    batch_risk_var = PySparkBatchRiskVarAdapter(risk_var_provider=risk_var)
    return AnalyticsApplicationService(
        risk_var=risk_var,
        fraud=FraudDetectorProvider(),
        surveillance=SurveillanceProvider(),
        sentiment=SentimentProvider(),
        identity=IdentityProvider(),
        forecast_provider=ForecastProvider(),
        summarisation=SummarisationProvider(),
        ollama_generate=OllamaGenerateAdapter(),
        hf_summarise=HfSummariseAdapter(),
        batch_risk_var=batch_risk_var,
    )
