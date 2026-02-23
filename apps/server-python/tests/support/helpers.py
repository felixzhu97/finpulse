from typing import Optional, Tuple

from fastapi.testclient import TestClient
from httpx import AsyncClient

from tests.support.api_paths import ApiPaths


def get_two_account_ids(client: TestClient) -> Tuple[Optional[str], Optional[str]]:
    r = client.get(f"{ApiPaths.ACCOUNTS}?limit=2&offset=0")
    if r.status_code != 200:
        return None, None
    data = r.json()
    if not isinstance(data, list) or len(data) < 2:
        return None, None
    try:
        return str(data[0]["account_id"]), str(data[1]["account_id"])
    except (KeyError, TypeError):
        return None, None


async def get_two_account_ids_async(
    client: AsyncClient,
) -> Tuple[Optional[str], Optional[str]]:
    r = await client.get(f"{ApiPaths.ACCOUNTS}?limit=2&offset=0")
    if r.status_code != 200:
        return None, None
    data = r.json()
    if not isinstance(data, list) or len(data) < 2:
        return None, None
    try:
        return str(data[0]["account_id"]), str(data[1]["account_id"])
    except (KeyError, TypeError):
        return None, None
