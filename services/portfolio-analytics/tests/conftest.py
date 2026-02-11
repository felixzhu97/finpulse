import warnings

warnings.filterwarnings("ignore", message=".*urllib3 v2 only supports OpenSSL.*")

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

from app.main import app

try:
    from main import app as blockchain_app
except ImportError:
    blockchain_app = None


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest_asyncio.fixture
async def blockchain_client():
    if blockchain_app is None:
        pytest.skip("blockchain app (main) not available")
    async with blockchain_app.router.lifespan_context(blockchain_app):
        async with AsyncClient(
            transport=ASGITransport(app=blockchain_app),
            base_url="http://test",
        ) as ac:
            yield ac


@pytest_asyncio.fixture
async def api_client(blockchain_client: AsyncClient):
    return blockchain_client
