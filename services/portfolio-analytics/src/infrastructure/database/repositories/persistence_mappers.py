from src.core.domain.entities.account import Account
from src.core.domain.entities.analytics import RiskMetrics, Valuation
from src.core.domain.entities.blockchain import Block, ChainTransaction, WalletBalance
from src.core.domain.entities.identity import Customer, UserPreference
from src.core.domain.entities.instrument import Bond, Instrument, Option
from src.core.domain.entities.market_data import MarketData
from src.core.domain.entities.payments import CashTransaction, Payment, Settlement
from src.core.domain.entities.portfolio import Position, PortfolioSchema
from src.core.domain.entities.trading import Order, Trade
from src.core.domain.entities.watchlist import Watchlist, WatchlistItem
from src.infrastructure.database.models import (
    AccountRow,
    BlockRow,
    BondRow,
    CashTransactionRow,
    ChainTransactionRow,
    CustomerRow,
    InstrumentRow,
    MarketDataRow,
    OptionRow,
    OrderRow,
    PaymentRow,
    PositionRow,
    PortfolioSchemaRow,
    RiskMetricsRow,
    SettlementRow,
    TradeRow,
    UserPreferenceRow,
    ValuationRow,
    WalletBalanceRow,
    WatchlistRow,
    WatchlistItemRow,
)


def _float(v):
    return float(v) if v is not None else None


def customer_row_to_entity(r: CustomerRow) -> Customer:
    return Customer(
        customer_id=r.customer_id,
        name=r.name,
        email=r.email,
        kyc_status=r.kyc_status,
        created_at=r.created_at,
    )


def customer_entity_to_dict(e: Customer) -> dict:
    return {
        "customer_id": e.customer_id,
        "name": e.name,
        "email": e.email,
        "kyc_status": e.kyc_status,
        "created_at": e.created_at,
    }


def user_preference_row_to_entity(r: UserPreferenceRow) -> UserPreference:
    return UserPreference(
        preference_id=r.preference_id,
        customer_id=r.customer_id,
        theme=r.theme,
        language=r.language,
        notifications_enabled=r.notifications_enabled,
        updated_at=r.updated_at,
    )


def user_preference_entity_to_dict(e: UserPreference) -> dict:
    return {
        "preference_id": e.preference_id,
        "customer_id": e.customer_id,
        "theme": e.theme,
        "language": e.language,
        "notifications_enabled": e.notifications_enabled,
        "updated_at": e.updated_at,
    }


def account_row_to_entity(r: AccountRow) -> Account:
    return Account(
        account_id=r.account_id,
        customer_id=r.customer_id,
        account_type=r.account_type,
        currency=r.currency,
        status=r.status,
        opened_at=r.opened_at,
    )


def account_entity_to_dict(e: Account) -> dict:
    return {
        "account_id": e.account_id,
        "customer_id": e.customer_id,
        "account_type": e.account_type,
        "currency": e.currency,
        "status": e.status,
        "opened_at": e.opened_at,
    }


def instrument_row_to_entity(r: InstrumentRow) -> Instrument:
    return Instrument(
        instrument_id=r.instrument_id,
        symbol=r.symbol,
        name=r.name,
        asset_class=r.asset_class,
        currency=r.currency,
        exchange=r.exchange,
    )


def instrument_entity_to_dict(e: Instrument) -> dict:
    return {
        "instrument_id": e.instrument_id,
        "symbol": e.symbol,
        "name": e.name,
        "asset_class": e.asset_class,
        "currency": e.currency,
        "exchange": e.exchange,
    }


def portfolio_schema_row_to_entity(r: PortfolioSchemaRow) -> PortfolioSchema:
    return PortfolioSchema(
        portfolio_id=r.portfolio_id,
        account_id=r.account_id,
        name=r.name,
        base_currency=r.base_currency,
        created_at=r.created_at,
    )


def portfolio_schema_entity_to_dict(e: PortfolioSchema) -> dict:
    return {
        "portfolio_id": e.portfolio_id,
        "account_id": e.account_id,
        "name": e.name,
        "base_currency": e.base_currency,
        "created_at": e.created_at,
    }


def watchlist_row_to_entity(r: WatchlistRow) -> Watchlist:
    return Watchlist(
        watchlist_id=r.watchlist_id,
        customer_id=r.customer_id,
        name=r.name,
        created_at=r.created_at,
    )


def watchlist_entity_to_dict(e: Watchlist) -> dict:
    return {
        "watchlist_id": e.watchlist_id,
        "customer_id": e.customer_id,
        "name": e.name,
        "created_at": e.created_at,
    }


def position_row_to_entity(r: PositionRow) -> Position:
    return Position(
        position_id=r.position_id,
        portfolio_id=r.portfolio_id,
        instrument_id=r.instrument_id,
        quantity=_float(r.quantity),
        cost_basis=_float(r.cost_basis),
        as_of_date=r.as_of_date,
    )


def position_entity_to_dict(e: Position) -> dict:
    return {
        "position_id": e.position_id,
        "portfolio_id": e.portfolio_id,
        "instrument_id": e.instrument_id,
        "quantity": e.quantity,
        "cost_basis": e.cost_basis,
        "as_of_date": e.as_of_date,
    }


def watchlist_item_row_to_entity(r: WatchlistItemRow) -> WatchlistItem:
    return WatchlistItem(
        watchlist_item_id=r.watchlist_item_id,
        watchlist_id=r.watchlist_id,
        instrument_id=r.instrument_id,
        added_at=r.added_at,
    )


def watchlist_item_entity_to_dict(e: WatchlistItem) -> dict:
    return {
        "watchlist_item_id": e.watchlist_item_id,
        "watchlist_id": e.watchlist_id,
        "instrument_id": e.instrument_id,
        "added_at": e.added_at,
    }


def bond_row_to_entity(r: BondRow) -> Bond:
    return Bond(
        bond_id=r.bond_id,
        instrument_id=r.instrument_id,
        face_value=_float(r.face_value),
        coupon_rate=_float(r.coupon_rate),
        ytm=_float(r.ytm),
        duration=_float(r.duration),
        convexity=_float(r.convexity),
        maturity_years=_float(r.maturity_years),
        frequency=r.frequency,
    )


def bond_entity_to_dict(e: Bond) -> dict:
    return {
        "bond_id": e.bond_id,
        "instrument_id": e.instrument_id,
        "face_value": e.face_value,
        "coupon_rate": e.coupon_rate,
        "ytm": e.ytm,
        "duration": e.duration,
        "convexity": e.convexity,
        "maturity_years": e.maturity_years,
        "frequency": e.frequency,
    }


def option_row_to_entity(r: OptionRow) -> Option:
    return Option(
        option_id=r.option_id,
        instrument_id=r.instrument_id,
        underlying_instrument_id=r.underlying_instrument_id,
        strike=_float(r.strike),
        expiry=r.expiry,
        option_type=r.option_type,
        risk_free_rate=_float(r.risk_free_rate),
        volatility=_float(r.volatility),
        bs_price=_float(r.bs_price),
        delta=_float(r.delta),
        gamma=_float(r.gamma),
        theta=_float(r.theta),
        vega=_float(r.vega),
        rho=_float(r.rho),
        implied_volatility=_float(r.implied_volatility),
    )


def option_entity_to_dict(e: Option) -> dict:
    return {
        "option_id": e.option_id,
        "instrument_id": e.instrument_id,
        "underlying_instrument_id": e.underlying_instrument_id,
        "strike": e.strike,
        "expiry": e.expiry,
        "option_type": e.option_type,
        "risk_free_rate": e.risk_free_rate,
        "volatility": e.volatility,
        "bs_price": e.bs_price,
        "delta": e.delta,
        "gamma": e.gamma,
        "theta": e.theta,
        "vega": e.vega,
        "rho": e.rho,
        "implied_volatility": e.implied_volatility,
    }


def order_row_to_entity(r: OrderRow) -> Order:
    return Order(
        order_id=r.order_id,
        account_id=r.account_id,
        instrument_id=r.instrument_id,
        side=r.side,
        quantity=_float(r.quantity),
        order_type=r.order_type,
        status=r.status,
        created_at=r.created_at,
    )


def order_entity_to_dict(e: Order) -> dict:
    return {
        "order_id": e.order_id,
        "account_id": e.account_id,
        "instrument_id": e.instrument_id,
        "side": e.side,
        "quantity": e.quantity,
        "order_type": e.order_type,
        "status": e.status,
        "created_at": e.created_at,
    }


def trade_row_to_entity(r: TradeRow) -> Trade:
    return Trade(
        trade_id=r.trade_id,
        order_id=r.order_id,
        quantity=_float(r.quantity),
        price=_float(r.price),
        fee=_float(r.fee),
        executed_at=r.executed_at,
    )


def trade_entity_to_dict(e: Trade) -> dict:
    return {
        "trade_id": e.trade_id,
        "order_id": e.order_id,
        "quantity": e.quantity,
        "price": e.price,
        "fee": e.fee,
        "executed_at": e.executed_at,
    }


def cash_transaction_row_to_entity(r: CashTransactionRow) -> CashTransaction:
    return CashTransaction(
        transaction_id=r.transaction_id,
        account_id=r.account_id,
        type=r.type,
        amount=_float(r.amount),
        currency=r.currency,
        status=r.status,
        created_at=r.created_at,
    )


def cash_transaction_entity_to_dict(e: CashTransaction) -> dict:
    return {
        "transaction_id": e.transaction_id,
        "account_id": e.account_id,
        "type": e.type,
        "amount": e.amount,
        "currency": e.currency,
        "status": e.status,
        "created_at": e.created_at,
    }


def payment_row_to_entity(r: PaymentRow) -> Payment:
    return Payment(
        payment_id=r.payment_id,
        account_id=r.account_id,
        counterparty=r.counterparty,
        amount=_float(r.amount),
        currency=r.currency,
        status=r.status,
        created_at=r.created_at,
    )


def payment_entity_to_dict(e: Payment) -> dict:
    return {
        "payment_id": e.payment_id,
        "account_id": e.account_id,
        "counterparty": e.counterparty,
        "amount": e.amount,
        "currency": e.currency,
        "status": e.status,
        "created_at": e.created_at,
    }


def settlement_row_to_entity(r: SettlementRow) -> Settlement:
    return Settlement(
        settlement_id=r.settlement_id,
        trade_id=r.trade_id,
        payment_id=r.payment_id,
        status=r.status,
        settled_at=r.settled_at,
    )


def settlement_entity_to_dict(e: Settlement) -> dict:
    return {
        "settlement_id": e.settlement_id,
        "trade_id": e.trade_id,
        "payment_id": e.payment_id,
        "status": e.status,
        "settled_at": e.settled_at,
    }


def market_data_row_to_entity(r: MarketDataRow) -> MarketData:
    return MarketData(
        data_id=r.data_id,
        instrument_id=r.instrument_id,
        timestamp=r.timestamp,
        open=_float(r.open),
        high=_float(r.high),
        low=_float(r.low),
        close=_float(r.close),
        volume=_float(r.volume),
        change_pct=_float(r.change_pct),
    )


def market_data_entity_to_dict(e: MarketData) -> dict:
    return {
        "data_id": e.data_id,
        "instrument_id": e.instrument_id,
        "timestamp": e.timestamp,
        "open": e.open,
        "high": e.high,
        "low": e.low,
        "close": e.close,
        "volume": e.volume,
        "change_pct": e.change_pct,
    }


def risk_metrics_row_to_entity(r: RiskMetricsRow) -> RiskMetrics:
    return RiskMetrics(
        metric_id=r.metric_id,
        portfolio_id=r.portfolio_id,
        as_of_date=r.as_of_date,
        risk_level=r.risk_level,
        volatility=_float(r.volatility),
        sharpe_ratio=_float(r.sharpe_ratio),
        var=_float(r.var),
        beta=_float(r.beta),
    )


def risk_metrics_entity_to_dict(e: RiskMetrics) -> dict:
    return {
        "metric_id": e.metric_id,
        "portfolio_id": e.portfolio_id,
        "as_of_date": e.as_of_date,
        "risk_level": e.risk_level,
        "volatility": e.volatility,
        "sharpe_ratio": e.sharpe_ratio,
        "var": e.var,
        "beta": e.beta,
    }


def valuation_row_to_entity(r: ValuationRow) -> Valuation:
    return Valuation(
        valuation_id=r.valuation_id,
        instrument_id=r.instrument_id,
        as_of_date=r.as_of_date,
        method=r.method,
        ev=_float(r.ev),
        equity_value=_float(r.equity_value),
        target_price=_float(r.target_price),
        multiples=_float(r.multiples),
        discount_rate=_float(r.discount_rate),
        growth_rate=_float(r.growth_rate),
    )


def valuation_entity_to_dict(e: Valuation) -> dict:
    return {
        "valuation_id": e.valuation_id,
        "instrument_id": e.instrument_id,
        "as_of_date": e.as_of_date,
        "method": e.method,
        "ev": e.ev,
        "equity_value": e.equity_value,
        "target_price": e.target_price,
        "multiples": e.multiples,
        "discount_rate": e.discount_rate,
        "growth_rate": e.growth_rate,
    }


def block_row_to_entity(
    r: BlockRow,
    transaction_ids: tuple[str, ...] = (),
) -> Block:
    return Block(
        index=r.block_index,
        timestamp=r.timestamp,
        previous_hash=r.previous_hash,
        transaction_ids=transaction_ids,
        hash=r.hash,
    )


def chain_transaction_row_to_entity(r: ChainTransactionRow) -> ChainTransaction:
    return ChainTransaction(
        tx_id=r.tx_id,
        block_index=r.block_index,
        sender_account_id=r.sender_account_id,
        receiver_account_id=r.receiver_account_id,
        amount=float(r.amount),
        currency=r.currency,
        created_at=r.created_at,
    )


def wallet_balance_row_to_entity(r: WalletBalanceRow) -> WalletBalance:
    return WalletBalance(
        account_id=r.account_id,
        currency=r.currency,
        balance=float(r.balance),
        updated_at=r.updated_at,
    )
