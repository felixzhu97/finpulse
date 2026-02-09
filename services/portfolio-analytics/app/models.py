from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PortfolioRow(Base):
    __tablename__ = "portfolio"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)


class PortfolioHistoryRow(Base):
    __tablename__ = "portfolio_history"

    time: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    portfolio_id: Mapped[str] = mapped_column(Text, primary_key=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint("portfolio_id", "time", name="uq_portfolio_history_portfolio_time"),
    )
