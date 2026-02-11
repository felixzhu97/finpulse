from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    kyc_status: Optional[str] = None


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    customer_id: UUID
    name: str
    email: Optional[str]
    kyc_status: Optional[str]
    created_at: datetime


class UserPreferenceCreate(BaseModel):
    customer_id: UUID
    theme: Optional[str] = None
    language: Optional[str] = None
    notifications_enabled: bool = True


class UserPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    preference_id: UUID
    customer_id: UUID
    theme: Optional[str]
    language: Optional[str]
    notifications_enabled: bool
    updated_at: datetime


class AccountCreate(BaseModel):
    customer_id: UUID
    account_type: str
    currency: str
    status: str = "active"


class AccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    account_id: UUID
    customer_id: UUID
    account_type: str
    currency: str
    status: str
    opened_at: datetime


class InstrumentCreate(BaseModel):
    symbol: str
    name: Optional[str] = None
    asset_class: Optional[str] = None
    currency: Optional[str] = None
    exchange: Optional[str] = None


class InstrumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    instrument_id: UUID
    symbol: str
    name: Optional[str]
    asset_class: Optional[str]
    currency: Optional[str]
    exchange: Optional[str]


class PortfolioSchemaCreate(BaseModel):
    account_id: UUID
    name: str
    base_currency: str


class PortfolioSchemaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    portfolio_id: UUID
    account_id: UUID
    name: str
    base_currency: str
    created_at: datetime


class WatchlistCreate(BaseModel):
    customer_id: UUID
    name: str


class WatchlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    watchlist_id: UUID
    customer_id: UUID
    name: str
    created_at: datetime


class PositionCreate(BaseModel):
    portfolio_id: UUID
    instrument_id: UUID
    quantity: float
    cost_basis: Optional[float] = None
    as_of_date: Optional[date] = None


class PositionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    position_id: UUID
    portfolio_id: UUID
    instrument_id: UUID
    quantity: float
    cost_basis: Optional[float]
    as_of_date: date


class WatchlistItemCreate(BaseModel):
    watchlist_id: UUID
    instrument_id: UUID


class WatchlistItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    watchlist_item_id: UUID
    watchlist_id: UUID
    instrument_id: UUID
    added_at: datetime


class BondCreate(BaseModel):
    instrument_id: UUID
    face_value: Optional[float] = None
    coupon_rate: Optional[float] = None
    ytm: Optional[float] = None
    duration: Optional[float] = None
    convexity: Optional[float] = None
    maturity_years: Optional[float] = None
    frequency: Optional[int] = None


class BondResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    bond_id: UUID
    instrument_id: UUID
    face_value: Optional[float]
    coupon_rate: Optional[float]
    ytm: Optional[float]
    duration: Optional[float]
    convexity: Optional[float]
    maturity_years: Optional[float]
    frequency: Optional[int]


class OptionCreate(BaseModel):
    instrument_id: UUID
    underlying_instrument_id: UUID
    strike: float
    expiry: datetime
    option_type: str
    risk_free_rate: Optional[float] = None
    volatility: Optional[float] = None
    bs_price: Optional[float] = None
    delta: Optional[float] = None
    gamma: Optional[float] = None
    theta: Optional[float] = None
    vega: Optional[float] = None
    rho: Optional[float] = None
    implied_volatility: Optional[float] = None


class OptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    option_id: UUID
    instrument_id: UUID
    underlying_instrument_id: UUID
    strike: float
    expiry: datetime
    option_type: str
    risk_free_rate: Optional[float]
    volatility: Optional[float]
    bs_price: Optional[float]
    delta: Optional[float]
    gamma: Optional[float]
    theta: Optional[float]
    vega: Optional[float]
    rho: Optional[float]
    implied_volatility: Optional[float]


class OrderCreate(BaseModel):
    account_id: UUID
    instrument_id: UUID
    side: str
    quantity: float
    order_type: str
    status: str = "pending"


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    order_id: UUID
    account_id: UUID
    instrument_id: UUID
    side: str
    quantity: float
    order_type: str
    status: str
    created_at: datetime


class TradeCreate(BaseModel):
    order_id: UUID
    quantity: float
    price: float
    fee: Optional[float] = 0


class TradeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    trade_id: UUID
    order_id: UUID
    quantity: float
    price: float
    fee: Optional[float]
    executed_at: datetime


class CashTransactionCreate(BaseModel):
    account_id: UUID
    type: str
    amount: float
    currency: str
    status: str = "completed"


class CashTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    transaction_id: UUID
    account_id: UUID
    type: str
    amount: float
    currency: str
    status: str
    created_at: datetime


class PaymentCreate(BaseModel):
    account_id: UUID
    counterparty: Optional[str] = None
    amount: float
    currency: str
    status: str = "pending"


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    payment_id: UUID
    account_id: UUID
    counterparty: Optional[str]
    amount: float
    currency: str
    status: str
    created_at: datetime


class SettlementCreate(BaseModel):
    trade_id: UUID
    payment_id: UUID
    status: str = "pending"
    settled_at: Optional[datetime] = None


class SettlementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    settlement_id: UUID
    trade_id: UUID
    payment_id: UUID
    status: str
    settled_at: Optional[datetime]


class MarketDataCreate(BaseModel):
    instrument_id: UUID
    timestamp: datetime
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    close: float
    volume: Optional[float] = None
    change_pct: Optional[float] = None


class MarketDataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    data_id: UUID
    instrument_id: UUID
    timestamp: datetime
    open: Optional[float]
    high: Optional[float]
    low: Optional[float]
    close: float
    volume: Optional[float]
    change_pct: Optional[float]


class RiskMetricsCreate(BaseModel):
    portfolio_id: UUID
    as_of_date: Optional[date] = None
    risk_level: Optional[str] = None
    volatility: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    var: Optional[float] = None
    beta: Optional[float] = None


class RiskMetricsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    metric_id: UUID
    portfolio_id: UUID
    as_of_date: date
    risk_level: Optional[str]
    volatility: Optional[float]
    sharpe_ratio: Optional[float]
    var: Optional[float]
    beta: Optional[float]


class ValuationCreate(BaseModel):
    instrument_id: UUID
    as_of_date: Optional[date] = None
    method: Optional[str] = None
    ev: Optional[float] = None
    equity_value: Optional[float] = None
    target_price: Optional[float] = None
    multiples: Optional[float] = None
    discount_rate: Optional[float] = None
    growth_rate: Optional[float] = None


class ValuationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    valuation_id: UUID
    instrument_id: UUID
    as_of_date: date
    method: Optional[str]
    ev: Optional[float]
    equity_value: Optional[float]
    target_price: Optional[float]
    multiples: Optional[float]
    discount_rate: Optional[float]
    growth_rate: Optional[float]


class TransferCreate(BaseModel):
    sender_account_id: UUID
    receiver_account_id: UUID
    amount: float
    currency: str = "SIM_COIN"


class SeedBalanceCreate(BaseModel):
    account_id: UUID
    currency: str = "SIM_COIN"
    amount: float


class BlockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    index: int
    timestamp: datetime
    previous_hash: str
    transaction_ids: tuple[str, ...]
    hash: str


class ChainTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    tx_id: UUID
    block_index: int
    sender_account_id: UUID
    receiver_account_id: UUID
    amount: float
    currency: str
    created_at: datetime


class BlockWithTransactionsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    block: BlockResponse
    transactions: list[ChainTransactionResponse]


class BalanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    account_id: UUID
    currency: str
    balance: float
