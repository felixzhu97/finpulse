from fastapi import APIRouter

from src.api.v1.endpoints import register_all_resources

router = APIRouter(prefix="/api/v1", tags=["resources"])
register_all_resources(router)
