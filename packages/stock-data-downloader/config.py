"""Configuration settings for stock data downloader."""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # API Keys
    alpha_vantage_api_key: Optional[str] = None
    
    # Download Configuration
    max_concurrent_requests: int = 50
    batch_size: int = 1000
    retry_attempts: int = 3
    retry_delay: float = 1.0
    
    # Data Storage
    output_dir: str = "./data"
    output_format: str = "parquet"  # parquet, csv, json
    
    # Rate Limiting
    requests_per_second: int = 10
    
    # Data Source Priority
    preferred_data_source: str = "yfinance"  # yfinance, alpha_vantage
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

# Ensure output directory exists
Path(settings.output_dir).mkdir(parents=True, exist_ok=True)
