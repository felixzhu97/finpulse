from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1.routers import router as ai_router
from src.api.v1.resource_router import router as resource_router
from src.api.v1.endpoints.app_routes import router as app_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from alembic import command
        from alembic.config import Config
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
    except Exception:
        pass
    yield


app = FastAPI(title="Portfolio Analytics API", lifespan=lifespan)
app.include_router(ai_router)
app.include_router(resource_router)
app.include_router(app_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
