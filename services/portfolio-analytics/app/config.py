import os

from dotenv import load_dotenv

load_dotenv()

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

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_DEFAULT_MODEL = os.environ.get("OLLAMA_DEFAULT_MODEL", "llama2")
HF_SUMMARISATION_MODEL = os.environ.get("HF_SUMMARISATION_MODEL", "sshleifer/distilbart-cnn-12-6")
