from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from src.api.dependencies import get_blockchain_service
from src.api.v1.schemas import (
    BalanceResponse,
    BlockResponse,
    BlockWithTransactionsResponse,
    ChainTransactionResponse,
    TransferCreate,
)
from src.core.application.use_cases.blockchain_service import (
    BlockchainApplicationService,
    InsufficientBalanceError,
)


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


def register(router: APIRouter) -> None:
    @router.get("/blockchain/blocks", response_model=list[BlockResponse])
    async def list_blocks(
        limit: int = Query(100, ge=1, le=500),
        offset: int = Query(0, ge=0),
        service: Annotated[
            BlockchainApplicationService, Depends(get_blockchain_service)
        ] = None,
    ):
        blocks = await service.get_chain(limit=limit, offset=offset)
        return [_block_to_response(b) for b in blocks]

    @router.get(
        "/blockchain/blocks/{block_index}",
        response_model=BlockWithTransactionsResponse,
    )
    async def get_block(
        block_index: int,
        service: Annotated[
            BlockchainApplicationService, Depends(get_blockchain_service)
        ] = None,
    ):
        result = await service.get_block_with_transactions(block_index)
        if result is None:
            raise HTTPException(status_code=404, detail="Block not found")
        block, transactions = result
        return BlockWithTransactionsResponse(
            block=_block_to_response(block),
            transactions=[_tx_to_response(t) for t in transactions],
        )

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
    ):
        try:
            tx = await service.submit_transfer(
                sender_account_id=body.sender_account_id,
                receiver_account_id=body.receiver_account_id,
                amount=body.amount,
                currency=body.currency,
            )
            return _tx_to_response(tx)
        except InsufficientBalanceError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @router.get(
        "/blockchain/transactions/{tx_id}",
        response_model=ChainTransactionResponse,
    )
    async def get_transaction(
        tx_id: UUID,
        service: Annotated[
            BlockchainApplicationService, Depends(get_blockchain_service)
        ] = None,
    ):
        tx = await service.get_transaction(tx_id)
        if tx is None:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return _tx_to_response(tx)

    @router.get("/blockchain/balances", response_model=BalanceResponse)
    async def get_balance(
        account_id: UUID = Query(...),
        currency: str = Query("SIM_COIN"),
        service: Annotated[
            BlockchainApplicationService, Depends(get_blockchain_service)
        ] = None,
    ):
        balance = await service.get_balance(account_id, currency)
        return BalanceResponse(
            account_id=account_id,
            currency=currency,
            balance=balance,
        )
