from tests.support import ApiPaths, run_concurrent_async


async def test_risk_var_historical(blockchain_client) -> None:
    r = await blockchain_client.post(
        ApiPaths.AI_RISK_VAR,
        json={
            "returns": [-0.01, 0.02, -0.005],
            "confidence": 0.95,
            "method": "historical",
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "var" in data
    assert "interpretation" in data
    assert data["method"] == "historical"


async def test_risk_var_with_portfolio_id(blockchain_client) -> None:
    r = await blockchain_client.post(
        ApiPaths.AI_RISK_VAR,
        json={
            "returns": [-0.01, 0.02],
            "confidence": 0.95,
            "method": "historical",
            "portfolio_id": "test-portfolio",
        },
    )
    assert r.status_code == 200
    assert r.json().get("portfolio_id") == "test-portfolio"


async def test_risk_var_invalid_method_returns_422(blockchain_client) -> None:
    r = await blockchain_client.post(
        ApiPaths.AI_RISK_VAR,
        json={
            "returns": [-0.01, 0.02],
            "confidence": 0.95,
            "method": "invalid",
        },
    )
    assert r.status_code == 422


async def test_risk_var_missing_returns_returns_422(blockchain_client) -> None:
    r = await blockchain_client.post(
        ApiPaths.AI_RISK_VAR,
        json={"confidence": 0.95, "method": "historical"},
    )
    assert r.status_code == 422


async def test_concurrent_risk_var_requests(blockchain_client) -> None:
    async def do_var(i: int):
        return await blockchain_client.post(
            ApiPaths.AI_RISK_VAR,
            json={
                "returns": [-0.01, 0.02, -0.005],
                "confidence": 0.95,
                "method": "historical",
            },
        )

    results = await run_concurrent_async(do_var, 20)
    assert all(r.status_code == 200 for r in results)
    for r in results:
        data = r.json()
        assert "var" in data and "interpretation" in data
