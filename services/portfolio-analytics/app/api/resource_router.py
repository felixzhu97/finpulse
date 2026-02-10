from fastapi import APIRouter

from app.api.routes import register_all_resources

router = APIRouter(prefix="/api/v1", tags=["resources"])
register_all_resources(router)
