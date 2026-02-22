import logging
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from src.api.dependencies import get_blockchain_service, get_cache
from src.api.v1.schemas import (
    BalanceResponse,
    BlockResponse,
    BlockWithTransactionsResponse,
    ChainTransactionResponse,
    SeedBalanceCreate,
    TransferCreate,
)
from src.core.application.use_cases.blockchain_service import (
    BlockchainApplicationService,
    InsufficientBalanceError,
)
from src.api.config import BLOCKCHAIN_KEY_PREFIX, CACHE_TTL_SECONDS
from src.infrastructure.cache import RedisCache


def _block_to_response(block) -> BlockResponse:
    return BlockResponse(
        index=block.index,
        timestamp=block.timestamp,
        previous_hash=block.previous_hash,
        transaction_ids=block.transaction_ids,
        hash=block.hash,
    )


def _tx_to_response(tx) -> ChainTransactionResponse:
    return ChainTransactionResponse(
        tx_id=tx.tx_id,
        block_index=tx.block_index,
        sender_account_id=tx.sender_account_id,
        receiver_account_id=tx.receiver_account_id,
        amount=tx.amount,
        currency=tx.currency,
        created_at=tx.created_at,
    )


def _block_to_cache(b: BlockResponse) -> dict:
    return b.model_dump(mode="json")


def _tx_to_cache(t: ChainTransactionResponse) -> dict:
    return t.model_dump(mode="json")


def register(router: APIRouter) -> None:
    @router.post(
        "/blockchain/seed-balance",
        response_model=BalanceResponse,
        status_code=201,
    )
    async def seed_balance(
        body: SeedBalanceCreate,
        service: Annotated[
            BlockchainApplicationService, Depends(get_blockchain_service)
        ] = None,
        cache: Annotated[RedisCache, Depends(get_cache)] = None,
    ):
        try:
            wallet = await service.seed_balance(
                body.account_id, body.currency, body.amount
            )
            if cache:
                await cache.delete(
                    f"{BLOCKCHAIN_KEY_PREFIX}balance:{body.account_id}:{body.currency}"
                )
            return BalanceResponse(
                account_id=wallet.account_id,
                currency=wallet.currency,
                balance=wallet.balance,
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @router.get("/blockchain/blocks", response_model=list[BlockResponse])
    async def list_blocks(
        limit: int = Query(100, ge=1, le=500),
        offset: int = Query(0, ge=0),
        service: Annotated[
            BlockchainApplicationService, Depends(get_blockchain_service)
        ] = None,
        cache: Annotated[RedisCache, Depends(get_cache)] = None,
    ):
        cache_key = f"{BLOCKCHAIN_KEY_PREFIX}blocks:{limit}:{offset}"
        if cache:
            cached = await cache.get(cache_key)
            if cached is not None:
                return [BlockResponse.model_validate(x) for x in cached]
        blocks = await service.get_chain(limit=limit, offset=offset)
        response = [_block_to_response(b) for b in blocks]
        if cache:
            await cache.set(
                cache_key,
                [_block_to_cache(r) for r in response],
                ttl_seconds=CACHE_TTL_SECONDS,
            )
        return response

    @router.get(
        "/blockchain/blocks/{block_index}",
        response_model=BlockWithTransactionsResponse,
    )
    async def get_block(
        block_index: int,
        service: Annotated[
            BlockchainApplicationService, Depends(get_blockchain_service)
        ] = None,
        cache: Annotated[RedisCache, Depends(get_cache)] = None,
    ):
        cache_key = f"{BLOCKCHAIN_KEY_PREFIX}block_txs:{block_index}"
        if cache:
            cached = await cache.get(cache_key)
            if cached is not None:
                return BlockWithTransactionsResponse.model_validate(cached)
        result = await service.get_block_with_transactions(block_index)
        if result is None:
            raise HTTPException(status_code=404, detail="Block not found")
        block, transactions = result
        response = BlockWithTransactionsResponse(
            block=_block_to_response(block),
            transactions=[_tx_to_response(t) for t in transactions],
        )
        if cache:
            await cache.set(
                cache_key,
                response.model_dump(mode="json"),
                ttl_seconds=CACHE_TTL_SECONDS,
            )
        return response

    @router.post(
        "/blockchain/transfers",
        response_model=ChainTransactionResponse,
        status_code=201,
    )
    async def create_transfer(
        body: TransferCreate,
        service: Annotated[
            BlockchainApplicationService, Depends(get_blockchain_service)
        ] = None,
        cache: Annotated[RedisCache, Depends(get_cache)] = None,
    ):
        try:
            tx = await service.submit_transfer(
                sender_account_id=body.sender_account_id,
                receiver_account_id=body.receiver_account_id,
                amount=body.amount,
                currency=body.currency,
            )
            if cache:
                await cache.delete_by_prefix(BLOCKCHAIN_KEY_PREFIX)
            return _tx_to_response(tx)
        except InsufficientBalanceError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logging.getLogger(__name__).exception("blockchain transfer failed")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get(
        "/blockchain/transactions/{tx_id}",
        response_model=ChainTransactionResponse,
    )
    async def get_transaction(
        tx_id: UUID,
        service: Annotated[
            BlockchainApplicationService, Depends(get_blockchain_service)
        ] = None,
        cache: Annotated[RedisCache, Depends(get_cache)] = None,
    ):
        cache_key = f"{BLOCKCHAIN_KEY_PREFIX}tx:{tx_id}"
        if cache:
            cached = await cache.get(cache_key)
            if cached is not None:
                return ChainTransactionResponse.model_validate(cached)
        tx = await service.get_transaction(tx_id)
        if tx is None:
            raise HTTPException(status_code=404, detail="Transaction not found")
        response = _tx_to_response(tx)
        if cache:
            await cache.set(
                cache_key,
                _tx_to_cache(response),
                ttl_seconds=CACHE_TTL_SECONDS,
            )
        return response

    @router.get("/blockchain/balances", response_model=BalanceResponse)
    async def get_balance(
        account_id: UUID = Query(...),
        currency: str = Query("SIM_COIN"),
        service: Annotated[
            BlockchainApplicationService, Depends(get_blockchain_service)
        ] = None,
        cache: Annotated[RedisCache, Depends(get_cache)] = None,
    ):
        cache_key = f"{BLOCKCHAIN_KEY_PREFIX}balance:{account_id}:{currency}"
        if cache:
            cached = await cache.get(cache_key)
            if cached is not None:
                return BalanceResponse.model_validate(cached)
        balance = await service.get_balance(account_id, currency)
        response = BalanceResponse(
            account_id=account_id,
            currency=currency,
            balance=balance,
        )
        if cache:
            await cache.set(
                cache_key,
                response.model_dump(mode="json"),
                ttl_seconds=CACHE_TTL_SECONDS,
            )
        return response
