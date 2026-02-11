import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")

from src.api.v1.resource_router import router as resource_router
from src.api.v1.endpoints.app_routes import router as app_router
from src.infrastructure.cache import create_redis_client
from src.infrastructure.database.session import create_engine_and_session_factory
from src.infrastructure.cache.quote_cache import QuoteCache
from src.infrastructure.database.repositories.realtime_quote_repository import RealtimeQuoteRepository
from src.infrastructure.market_data.kafka_quote_consumer import KafkaQuoteConsumer
from src.infrastructure.market_data.kafka_quote_producer import KafkaQuoteProducer
from src.infrastructure.market_data.mock_quote_writer import MockQuoteWriter


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from alembic import command
        from alembic.config import Config
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
    except Exception:
        pass
    engine, session_factory = create_engine_and_session_factory()
    app.state.engine = engine
    app.state.session_factory = session_factory
    redis_client = create_redis_client()
    app.state.redis = redis_client
    quote_cache = QuoteCache()
    quote_repo = RealtimeQuoteRepository(cache=quote_cache)
    app.state.realtime_quote_repo = quote_repo

    def on_kafka_batch(batch: dict) -> None:
        quote_repo.upsert_quotes(batch)
        try:
            quote_repo.insert_ticks(batch)
        except Exception:
            pass

    kafka_consumer = KafkaQuoteConsumer(on_batch=on_kafka_batch)
    kafka_consumer.start()

    kafka_producer = KafkaQuoteProducer()
    mock_writer = MockQuoteWriter(repository=quote_repo, producer=kafka_producer)
    mock_writer.start()
    app.state.mock_quote_writer = mock_writer
    app.state.kafka_quote_consumer = kafka_consumer
    yield
    mock_writer.stop()
    kafka_consumer.stop()
    if redis_client:
        await redis_client.aclose()
    await engine.dispose()


app = FastAPI(title="Portfolio Analytics API", lifespan=lifespan)
app.include_router(app_router)
app.include_router(resource_router)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    path = request.url.path
    query = str(request.query_params) if request.query_params else ""
    method = request.method
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
