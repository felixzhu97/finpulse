from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

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


def _instrument_to_response(e: Instrument) -> InstrumentResponse:
    return InstrumentResponse(
        instrument_id=e.instrument_id,
        symbol=e.symbol,
        name=e.name,
        asset_class=e.asset_class,
        currency=e.currency,
        exchange=e.exchange,
    )


def _bond_to_response(e: Bond) -> BondResponse:
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


def _option_to_response(e: Option) -> OptionResponse:
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
    @router.get("/instruments", response_model=list[InstrumentResponse])
    async def list_instruments(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_instrument_repo)] = None,
    ):
        return [_instrument_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/instruments/{instrument_id}", response_model=InstrumentResponse)
    async def get_instrument(
        instrument_id: UUID,
        repo: Annotated[object, Depends(get_instrument_repo)] = None,
    ):
        entity = await repo.get_by_id(instrument_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Instrument not found")
        return _instrument_to_response(entity)

    @router.post("/instruments", response_model=InstrumentResponse, status_code=201)
    async def create_instrument(
        body: InstrumentCreate,
        repo: Annotated[object, Depends(get_instrument_repo)] = None,
    ):
        entity = Instrument(
            instrument_id=uuid4(),
            symbol=body.symbol,
            name=body.name,
            asset_class=body.asset_class,
            currency=body.currency,
            exchange=body.exchange,
        )
        created = await repo.add(entity)
        return _instrument_to_response(created)

    @router.post("/instruments/batch", response_model=list[InstrumentResponse], status_code=201)
    async def create_instruments_batch(
        body: list[InstrumentCreate],
        repo: Annotated[object, Depends(get_instrument_repo)] = None,
    ):
        result = []
        for item in body:
            entity = Instrument(
                instrument_id=uuid4(),
                symbol=item.symbol,
                name=item.name,
                asset_class=item.asset_class,
                currency=item.currency,
                exchange=item.exchange,
            )
            created = await repo.add(entity)
            result.append(_instrument_to_response(created))
        return result

    @router.put("/instruments/{instrument_id}", response_model=InstrumentResponse)
    async def update_instrument(
        instrument_id: UUID,
        body: InstrumentCreate,
        repo: Annotated[object, Depends(get_instrument_repo)] = None,
    ):
        entity = Instrument(
            instrument_id=instrument_id,
            symbol=body.symbol,
            name=body.name,
            asset_class=body.asset_class,
            currency=body.currency,
            exchange=body.exchange,
        )
        updated = await repo.save(entity)
        if not updated:
            raise HTTPException(status_code=404, detail="Instrument not found")
        return _instrument_to_response(updated)

    @router.delete("/instruments/{instrument_id}", status_code=204)
    async def delete_instrument(
        instrument_id: UUID,
        repo: Annotated[object, Depends(get_instrument_repo)] = None,
    ):
        ok = await repo.remove(instrument_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Instrument not found")

    @router.get("/bonds", response_model=list[BondResponse])
    async def list_bonds(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_bond_repo)] = None,
    ):
        return [_bond_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/bonds/{bond_id}", response_model=BondResponse)
    async def get_bond(
        bond_id: UUID,
        repo: Annotated[object, Depends(get_bond_repo)] = None,
    ):
        entity = await repo.get_by_id(bond_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Bond not found")
        return _bond_to_response(entity)

    @router.post("/bonds", response_model=BondResponse, status_code=201)
    async def create_bond(
        body: BondCreate,
        repo: Annotated[object, Depends(get_bond_repo)] = None,
    ):
        entity = Bond(
            bond_id=uuid4(),
            instrument_id=body.instrument_id,
            face_value=body.face_value,
            coupon_rate=body.coupon_rate,
            ytm=body.ytm,
            duration=body.duration,
            convexity=body.convexity,
            maturity_years=body.maturity_years,
            frequency=body.frequency,
        )
        created = await repo.add(entity)
        return _bond_to_response(created)

    @router.post("/bonds/batch", response_model=list[BondResponse], status_code=201)
    async def create_bonds_batch(
        body: list[BondCreate],
        repo: Annotated[object, Depends(get_bond_repo)] = None,
    ):
        result = []
        for item in body:
            entity = Bond(
                bond_id=uuid4(),
                instrument_id=item.instrument_id,
                face_value=item.face_value,
                coupon_rate=item.coupon_rate,
                ytm=item.ytm,
                duration=item.duration,
                convexity=item.convexity,
                maturity_years=item.maturity_years,
                frequency=item.frequency,
            )
            created = await repo.add(entity)
            result.append(_bond_to_response(created))
        return result

    @router.put("/bonds/{bond_id}", response_model=BondResponse)
    async def update_bond(
        bond_id: UUID,
        body: BondCreate,
        repo: Annotated[object, Depends(get_bond_repo)] = None,
    ):
        entity = Bond(
            bond_id=bond_id,
            instrument_id=body.instrument_id,
            face_value=body.face_value,
            coupon_rate=body.coupon_rate,
            ytm=body.ytm,
            duration=body.duration,
            convexity=body.convexity,
            maturity_years=body.maturity_years,
            frequency=body.frequency,
        )
        updated = await repo.save(entity)
        if not updated:
            raise HTTPException(status_code=404, detail="Bond not found")
        return _bond_to_response(updated)

    @router.delete("/bonds/{bond_id}", status_code=204)
    async def delete_bond(
        bond_id: UUID,
        repo: Annotated[object, Depends(get_bond_repo)] = None,
    ):
        ok = await repo.remove(bond_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Bond not found")

    @router.get("/options", response_model=list[OptionResponse])
    async def list_options(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_option_repo)] = None,
    ):
        return [_option_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/options/{option_id}", response_model=OptionResponse)
    async def get_option(
        option_id: UUID,
        repo: Annotated[object, Depends(get_option_repo)] = None,
    ):
        entity = await repo.get_by_id(option_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Option not found")
        return _option_to_response(entity)

    @router.post("/options", response_model=OptionResponse, status_code=201)
    async def create_option(
        body: OptionCreate,
        repo: Annotated[object, Depends(get_option_repo)] = None,
    ):
        entity = Option(
            option_id=uuid4(),
            instrument_id=body.instrument_id,
            underlying_instrument_id=body.underlying_instrument_id,
            strike=body.strike,
            expiry=body.expiry,
            option_type=body.option_type,
            risk_free_rate=body.risk_free_rate,
            volatility=body.volatility,
            bs_price=body.bs_price,
            delta=body.delta,
            gamma=body.gamma,
            theta=body.theta,
            vega=body.vega,
            rho=body.rho,
            implied_volatility=body.implied_volatility,
        )
        created = await repo.add(entity)
        return _option_to_response(created)

    @router.post("/options/batch", response_model=list[OptionResponse], status_code=201)
    async def create_options_batch(
        body: list[OptionCreate],
        repo: Annotated[object, Depends(get_option_repo)] = None,
    ):
        result = []
        for item in body:
            entity = Option(
                option_id=uuid4(),
                instrument_id=item.instrument_id,
                underlying_instrument_id=item.underlying_instrument_id,
                strike=item.strike,
                expiry=item.expiry,
                option_type=item.option_type,
                risk_free_rate=item.risk_free_rate,
                volatility=item.volatility,
                bs_price=item.bs_price,
                delta=item.delta,
                gamma=item.gamma,
                theta=item.theta,
                vega=item.vega,
                rho=item.rho,
                implied_volatility=item.implied_volatility,
            )
            created = await repo.add(entity)
            result.append(_option_to_response(created))
        return result

    @router.put("/options/{option_id}", response_model=OptionResponse)
    async def update_option(
        option_id: UUID,
        body: OptionCreate,
        repo: Annotated[object, Depends(get_option_repo)] = None,
    ):
        entity = Option(
            option_id=option_id,
            instrument_id=body.instrument_id,
            underlying_instrument_id=body.underlying_instrument_id,
            strike=body.strike,
            expiry=body.expiry,
            option_type=body.option_type,
            risk_free_rate=body.risk_free_rate,
            volatility=body.volatility,
            bs_price=body.bs_price,
            delta=body.delta,
            gamma=body.gamma,
            theta=body.theta,
            vega=body.vega,
            rho=body.rho,
            implied_volatility=body.implied_volatility,
        )
        updated = await repo.save(entity)
        if not updated:
            raise HTTPException(status_code=404, detail="Option not found")
        return _option_to_response(updated)

    @router.delete("/options/{option_id}", status_code=204)
    async def delete_option(
        option_id: UUID,
        repo: Annotated[object, Depends(get_option_repo)] = None,
    ):
        ok = await repo.remove(option_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Option not found")
