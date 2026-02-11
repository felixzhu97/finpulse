from uuid import uuid4

from tests.support import ApiPaths


async def test_list_user_preferences(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.USER_PREFERENCES)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_get_user_preference_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(
        ApiPaths.user_preference_by_id(str(uuid4()))
    )
    assert r.status_code == 404
