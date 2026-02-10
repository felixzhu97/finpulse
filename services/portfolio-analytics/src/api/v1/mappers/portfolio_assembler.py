from src.api.v1.schemas.portfolio_read_models import (
    AccountView,
    HoldingView,
    HistoryPointView,
    PortfolioSummaryView,
    PortfolioView,
)
from src.core.domain.entities.portfolio import Account, Holding, Portfolio
from src.core.domain.value_objects.portfolio import HistoryPoint, PortfolioSummary


def assemble_holding(h: Holding) -> HoldingView:
    return HoldingView(
        id=h.id,
        symbol=h.symbol,
        name=h.name,
        quantity=h.quantity,
        price=h.price,
        costBasis=h.cost_basis,
        marketValue=h.market_value,
        profit=h.profit,
        profitRate=h.profit_rate,
        assetClass=h.asset_class,
        riskLevel=h.risk_level,
    )


def assemble_account(a: Account) -> AccountView:
    return AccountView(
        id=a.id,
        name=a.name,
        type=a.type,
        currency=a.currency,
        balance=a.balance,
        todayChange=a.today_change,
        holdings=[assemble_holding(h) for h in a.holdings],
    )


def assemble_summary(s: PortfolioSummary) -> PortfolioSummaryView:
    return PortfolioSummaryView(
        totalAssets=s.total_assets,
        totalLiabilities=s.total_liabilities,
        netWorth=s.net_worth,
        todayChange=s.today_change,
        weekChange=s.week_change,
    )


def assemble_history_point(p: HistoryPoint) -> HistoryPointView:
    return HistoryPointView(date=p.date, value=p.value)


def assemble_portfolio(p: Portfolio) -> PortfolioView:
    return PortfolioView(
        id=p.id,
        ownerName=p.owner_name,
        baseCurrency=p.base_currency,
        accounts=[assemble_account(a) for a in p.accounts],
        summary=assemble_summary(p.summary),
        history=[assemble_history_point(h) for h in p.history],
    )
