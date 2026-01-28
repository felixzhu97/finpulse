"""Data source adapters for fetching stock data."""
import asyncio
import yfinance as yf
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import pandas as pd
from tenacity import retry, stop_after_attempt, wait_exponential
import logging
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Thread pool for running synchronous yfinance calls
_executor = ThreadPoolExecutor(max_workers=10)


class YahooFinanceAdapter:
    """Adapter for Yahoo Finance data source."""
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def fetch_stock_data(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = "max"
    ) -> Optional[pd.DataFrame]:
        """
        Fetch historical stock data for a symbol.
        
        Args:
            symbol: Stock ticker symbol
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            period: Period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
        
        Returns:
            DataFrame with stock data or None if failed
        """
        try:
            # Run yfinance in thread pool since it's synchronous
            loop = asyncio.get_event_loop()
            ticker = yf.Ticker(symbol)
            
            if start_date and end_date:
                data = await loop.run_in_executor(
                    _executor,
                    lambda: ticker.history(start=start_date, end=end_date)
                )
            else:
                data = await loop.run_in_executor(
                    _executor,
                    lambda: ticker.history(period=period)
                )
            
            if data.empty:
                logger.warning(f"No data found for symbol: {symbol}")
                return None
            
            # Add symbol column
            data['Symbol'] = symbol
            data.reset_index(inplace=True)
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {str(e)}")
            return None
    
    async def fetch_multiple_symbols(
        self,
        symbols: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = "max"
    ) -> Dict[str, pd.DataFrame]:
        """
        Fetch data for multiple symbols concurrently.
        
        Args:
            symbols: List of stock ticker symbols
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            period: Period string
        
        Returns:
            Dictionary mapping symbols to DataFrames
        """
        tasks = [
            self.fetch_stock_data(symbol, start_date, end_date, period)
            for symbol in symbols
        ]
        
        results_list = await asyncio.gather(*tasks, return_exceptions=True)
        
        results = {}
        for symbol, result in zip(symbols, results_list):
            if isinstance(result, pd.DataFrame) and not result.empty:
                results[symbol] = result
        
        return results
    
    def get_info(self, symbol: str) -> Dict[str, Any]:
        """Get stock information/metadata."""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return info
        except Exception as e:
            logger.error(f"Error fetching info for {symbol}: {str(e)}")
            return {}


class AlphaVantageAdapter:
    """Adapter for Alpha Vantage data source."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def fetch_stock_data(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Optional[pd.DataFrame]:
        """Fetch data from Alpha Vantage (requires API key)."""
        if not self.api_key:
            logger.warning("Alpha Vantage API key not provided")
            return None
        
        # Implementation would go here
        # Alpha Vantage has rate limits (5 calls/min for free tier)
        logger.info(f"Alpha Vantage adapter not fully implemented for {symbol}")
        return None


class DataSourceFactory:
    """Factory for creating data source adapters."""
    
    @staticmethod
    def create_adapter(source: str = "yfinance", **kwargs):
        """Create a data source adapter."""
        if source == "yfinance":
            return YahooFinanceAdapter()
        elif source == "alpha_vantage":
            api_key = kwargs.get("api_key")
            return AlphaVantageAdapter(api_key=api_key)
        else:
            raise ValueError(f"Unknown data source: {source}")
