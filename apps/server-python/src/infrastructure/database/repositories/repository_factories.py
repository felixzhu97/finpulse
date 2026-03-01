from sqlalchemy.ext.asyncio import AsyncSession

from src.core.domain.entities.analytics import RiskMetrics, Valuation
from src.infrastructure.database.repositories.persistence_mappers import (
    risk_metrics_entity_to_dict,
    risk_metrics_row_to_entity,
    valuation_entity_to_dict,
    valuation_row_to_entity,
)
from src.infrastructure.database.repositories.sql_repository import SqlRepository
from src.infrastructure.database.models import RiskMetricsRow, ValuationRow


def risk_metrics_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        RiskMetricsRow,
        "metric_id",
        risk_metrics_row_to_entity,
        risk_metrics_entity_to_dict,
    )


def valuation_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        ValuationRow,
        "valuation_id",
        valuation_row_to_entity,
        valuation_entity_to_dict,
    )
