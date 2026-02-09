from app.application.portfolio_service import PortfolioApplicationService
from app.application.analytics_service import AnalyticsApplicationService
from app.application.market_data_service import MarketDataService
from app.infrastructure.persistence import PortfolioRepository
from app.infrastructure.messaging import EventPublisher
from app.infrastructure.market_data.kafka_provider import KafkaMarketDataProvider
from app.infrastructure.analytics import (
  RiskVarProvider,
  FraudDetectorProvider,
  SurveillanceProvider,
  SentimentProvider,
  IdentityProvider,
  ForecastProvider,
  SummarisationProvider,
)


def _portfolio_repository() -> PortfolioRepository:
  return PortfolioRepository()


def _event_publisher() -> EventPublisher:
  return EventPublisher()


def portfolio_service() -> PortfolioApplicationService:
  return PortfolioApplicationService(
    repository=_portfolio_repository(),
    event_publisher=_event_publisher(),
  )


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
  )
