from tests.support import ApiPaths


async def test_seed_portfolio(blockchain_client) -> None:
    payload = {
        "id": "test-seed-1",
        "ownerName": "Test User",
        "baseCurrency": "USD",
        "accounts": [
            {
                "id": "acc-1",
                "name": "Brokerage",
                "type": "brokerage",
                "currency": "USD",
                "balance": 10000,
                "todayChange": 0,
                "holdings": [],
            }
        ],
        "summary": {
            "totalAssets": 10000,
            "totalLiabilities": 0,
            "netWorth": 10000,
            "todayChange": 0,
            "weekChange": 0,
        },
        "history": [{"date": "2024-01-01", "value": 10000}],
    }
    r = await blockchain_client.post(ApiPaths.SEED, json=payload)
    assert r.status_code == 200
    assert r.json() == {"ok": True}


async def test_seed_invalid_returns_400(blockchain_client) -> None:
    r = await blockchain_client.post(ApiPaths.SEED, json={"invalid": "payload"})
    assert r.status_code == 400
