from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.infrastructure.persistence import PortfolioHistoryRepository, PortfolioRepository
from app.application.portfolio_service import PortfolioApplicationService
from app.infrastructure.messaging import EventPublisher


async def get_portfolio_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> PortfolioApplicationService:
    history_repo = PortfolioHistoryRepository(session)
    portfolio_repo = PortfolioRepository(session, history_repo=history_repo)
    return PortfolioApplicationService(
        repository=portfolio_repo,
        event_publisher=EventPublisher(),
    )
