import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from src.api.composition import lifespan
from src.api.v1.endpoints.app_routes import router as app_router
from src.api.v1.resource_router import router as resource_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")

app = FastAPI(title="Portfolio Analytics API", lifespan=lifespan)
app.include_router(app_router)
app.include_router(resource_router)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    path = request.url.path
    query = str(request.query_params) if request.query_params else ""
    method = request.method
    logger.info("%s %s%s <- in", method, path, f"?{query}" if query else "")
    response = await call_next(request)
    elapsed = (time.time() - start) * 1000
    logger.info(
        "%s %s%s -> %d (%.0fms)",
        method,
        path,
        f"?{query}" if query else "",
        response.status_code,
        elapsed,
    )
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
