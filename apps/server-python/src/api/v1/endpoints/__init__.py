from fastapi import APIRouter

from src.api.v1.endpoints import analytics_routes


def register_all_resources(router: APIRouter) -> None:
    analytics_routes.register(router)
