from uuid import uuid4

from tests.support import ApiPaths


async def test_get_transaction_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(
        ApiPaths.blockchain_transaction(str(uuid4()))
    )
    assert r.status_code == 404
