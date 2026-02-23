from uuid import UUID, uuid4

from fastapi import APIRouter

from src.api.v1.endpoints.crud_helpers import register_crud
from src.api.v1.schemas import (
    BondCreate,
    BondResponse,
    InstrumentCreate,
    InstrumentResponse,
    OptionCreate,
    OptionResponse,
)
from src.api.dependencies import get_bond_repo, get_instrument_repo, get_option_repo
from src.core.domain.entities.instrument import Bond, Instrument, Option


def _instrument_response(e: Instrument) -> InstrumentResponse:
    return InstrumentResponse(
        instrument_id=e.instrument_id,
        symbol=e.symbol,
        name=e.name,
        asset_class=e.asset_class,
        currency=e.currency,
        exchange=e.exchange,
    )


def _bond_response(e: Bond) -> BondResponse:
    return BondResponse(
        bond_id=e.bond_id,
        instrument_id=e.instrument_id,
        face_value=e.face_value,
        coupon_rate=e.coupon_rate,
        ytm=e.ytm,
        duration=e.duration,
        convexity=e.convexity,
        maturity_years=e.maturity_years,
        frequency=e.frequency,
    )


def _option_response(e: Option) -> OptionResponse:
    return OptionResponse(
        option_id=e.option_id,
        instrument_id=e.instrument_id,
        underlying_instrument_id=e.underlying_instrument_id,
        strike=e.strike,
        expiry=e.expiry,
        option_type=e.option_type,
        risk_free_rate=e.risk_free_rate,
        volatility=e.volatility,
        bs_price=e.bs_price,
        delta=e.delta,
        gamma=e.gamma,
        theta=e.theta,
        vega=e.vega,
        rho=e.rho,
        implied_volatility=e.implied_volatility,
    )


def register(router: APIRouter) -> None:
    register_crud(
        router, "instruments", "instrument_id",
        InstrumentCreate, InstrumentResponse, get_instrument_repo,
        _instrument_response,
        lambda b: Instrument(instrument_id=uuid4(), symbol=b.symbol, name=b.name, asset_class=b.asset_class, currency=b.currency, exchange=b.exchange),
        lambda pk, b, _: Instrument(instrument_id=pk, symbol=b.symbol, name=b.name, asset_class=b.asset_class, currency=b.currency, exchange=b.exchange),
        "Instrument not found",
    )
    register_crud(
        router, "bonds", "bond_id",
        BondCreate, BondResponse, get_bond_repo,
        _bond_response,
        lambda b: Bond(bond_id=uuid4(), instrument_id=b.instrument_id, face_value=b.face_value, coupon_rate=b.coupon_rate, ytm=b.ytm, duration=b.duration, convexity=b.convexity, maturity_years=b.maturity_years, frequency=b.frequency),
        lambda pk, b, _: Bond(bond_id=pk, instrument_id=b.instrument_id, face_value=b.face_value, coupon_rate=b.coupon_rate, ytm=b.ytm, duration=b.duration, convexity=b.convexity, maturity_years=b.maturity_years, frequency=b.frequency),
        "Bond not found",
    )
    register_crud(
        router, "options", "option_id",
        OptionCreate, OptionResponse, get_option_repo,
        _option_response,
        lambda b: Option(option_id=uuid4(), instrument_id=b.instrument_id, underlying_instrument_id=b.underlying_instrument_id, strike=b.strike, expiry=b.expiry, option_type=b.option_type, risk_free_rate=b.risk_free_rate, volatility=b.volatility, bs_price=b.bs_price, delta=b.delta, gamma=b.gamma, theta=b.theta, vega=b.vega, rho=b.rho, implied_volatility=b.implied_volatility),
        lambda pk, b, _: Option(option_id=pk, instrument_id=b.instrument_id, underlying_instrument_id=b.underlying_instrument_id, strike=b.strike, expiry=b.expiry, option_type=b.option_type, risk_free_rate=b.risk_free_rate, volatility=b.volatility, bs_price=b.bs_price, delta=b.delta, gamma=b.gamma, theta=b.theta, vega=b.vega, rho=b.rho, implied_volatility=b.implied_volatility),
        "Option not found",
    )
