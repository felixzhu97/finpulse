from uuid import uuid4

from tests.support import ApiPaths


async def test_list_risk_metrics(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.RISK_METRICS)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_get_risk_metric_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(
        ApiPaths.risk_metric_by_id(str(uuid4()))
    )
    assert r.status_code == 404
