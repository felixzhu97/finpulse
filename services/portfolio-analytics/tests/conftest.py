import warnings

warnings.filterwarnings("ignore", message=".*urllib3 v2 only supports OpenSSL.*")

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
  return TestClient(app)
