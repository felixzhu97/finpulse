import warnings

warnings.filterwarnings("ignore", message=".*urllib3 v2 only supports OpenSSL.*")

import pytest
import pytest_asyncio
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient


@pytest.fixture
def mock_app_state():
    mock_engine = MagicMock()
    mock_engine.dispose = AsyncMock()
    mock_session_factory = MagicMock()
    mock_redis = MagicMock()
    mock_redis.aclose = AsyncMock()
    mock_quote_repo = MagicMock()
    mock_kafka_consumer = MagicMock()
    mock_kafka_consumer.start = MagicMock()
    mock_kafka_consumer.stop = MagicMock()
    mock_kafka_producer = MagicMock()
    mock_mock_writer = MagicMock()
    mock_mock_writer.start = MagicMock()
    mock_mock_writer.stop = MagicMock()
    return {
        "engine": mock_engine,
        "session_factory": mock_session_factory,
        "redis": mock_redis,
        "realtime_quote_repo": mock_quote_repo,
        "kafka_consumer": mock_kafka_consumer,
        "kafka_producer": mock_kafka_producer,
        "mock_quote_writer": mock_mock_writer,
    }


@pytest.fixture
def client(mock_app_state) -> TestClient:
    from main import app
    for key, value in mock_app_state.items():
        setattr(app.state, key, value)
    return TestClient(app)


@pytest_asyncio.fixture
async def blockchain_client(mock_app_state):
    from main import app
    for key, value in mock_app_state.items():
        setattr(app.state, key, value)
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def api_client(blockchain_client: AsyncClient):
    return blockchain_client
