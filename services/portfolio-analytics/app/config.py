import os

DATABASE_URL = os.environ.get(
  "DATABASE_URL",
  "postgresql://postgres:postgres@127.0.0.1:5433/portfolio",
)
KAFKA_BOOTSTRAP_SERVERS = os.environ.get(
  "KAFKA_BOOTSTRAP_SERVERS",
  "127.0.0.1:9092",
)
KAFKA_PORTFOLIO_TOPIC = os.environ.get(
  "KAFKA_PORTFOLIO_TOPIC",
  "portfolio.events",
)
