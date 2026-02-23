import json
from datetime import datetime
from typing import List

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from pydantic import BaseModel


class BlockHashPayload(BaseModel):
    index: int
    timestamp: str
    previous_hash: str
    transaction_ids: List[str]

    class Config:
        frozen = True


def compute_block_hash(
    index: int,
    timestamp: datetime,
    previous_hash: str,
    transaction_ids: tuple[str, ...],
) -> str:
    payload = BlockHashPayload(
        index=index,
        timestamp=timestamp.isoformat(),
        previous_hash=previous_hash,
        transaction_ids=list(transaction_ids),
    )
    data = json.dumps(payload.model_dump(), sort_keys=True).encode("utf-8")
    digest = hashes.Hash(hashes.SHA256(), backend=default_backend())
    digest.update(data)
    return digest.finalize().hex()
