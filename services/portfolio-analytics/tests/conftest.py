import warnings

warnings.filterwarnings("ignore", message=".*urllib3 v2 only supports OpenSSL.*")

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

try:
    from main import app
except ImportError:
    app = None


@pytest.fixture
def client() -> TestClient:
    if app is None:
        pytest.skip("main app not available")
    return TestClient(app)


@pytest_asyncio.fixture
async def blockchain_client():
    if app is None:
        pytest.skip("main app not available")
    async with app.router.lifespan_context(app):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as ac:
            yield ac


@pytest_asyncio.fixture
async def api_client(blockchain_client: AsyncClient):
    return blockchain_client
