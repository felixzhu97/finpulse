"""Main stock data downloader with async support and progress tracking."""
import asyncio
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
import pandas as pd
from datetime import datetime
from tqdm.asyncio import tqdm as atqdm
from tqdm import tqdm
import aiofiles
import json

from config import settings
from data_sources import DataSourceFactory, YahooFinanceAdapter
from asyncio_throttle import Throttler

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class StockDataDownloader:
    """High-performance stock data downloader."""
    
    def __init__(self):
        self.adapter = DataSourceFactory.create_adapter(
            source=settings.preferred_data_source,
            api_key=settings.alpha_vantage_api_key
        )
        self.throttler = Throttler(rate_limit=settings.requests_per_second)
        self.downloaded_count = 0
        self.failed_count = 0
        self.progress_file = Path(settings.output_dir) / "download_progress.json"
        self.load_progress()
    
    def load_progress(self):
        """Load download progress from file."""
        if self.progress_file.exists():
            try:
                with open(self.progress_file, 'r') as f:
                    progress = json.load(f)
                    self.downloaded_symbols = set(progress.get('downloaded', []))
                    self.failed_symbols = set(progress.get('failed', []))
            except Exception as e:
                logger.warning(f"Could not load progress: {e}")
                self.downloaded_symbols = set()
                self.failed_symbols = set()
        else:
            self.downloaded_symbols = set()
            self.failed_symbols = set()
    
    def save_progress(self):
        """Save download progress to file."""
        try:
            progress = {
                'downloaded': list(self.downloaded_symbols),
                'failed': list(self.failed_symbols),
                'last_updated': datetime.now().isoformat()
            }
            with open(self.progress_file, 'w') as f:
                json.dump(progress, f, indent=2)
        except Exception as e:
            logger.error(f"Could not save progress: {e}")
    
    async def download_single_symbol(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = "max"
    ) -> Optional[pd.DataFrame]:
        """
        Download data for a single symbol.
        
        Args:
            symbol: Stock ticker symbol
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            period: Period string
        
        Returns:
            DataFrame with stock data or None
        """
        # Skip if already downloaded
        if symbol in self.downloaded_symbols:
            logger.debug(f"Skipping {symbol} - already downloaded")
            return None
        
        # Skip if previously failed
        if symbol in self.failed_symbols:
            logger.debug(f"Skipping {symbol} - previously failed")
            return None
        
        async with self.throttler:
            try:
                if isinstance(self.adapter, YahooFinanceAdapter):
                    data = await self.adapter.fetch_stock_data(
                        symbol, start_date, end_date, period
                    )
                else:
                    data = await self.adapter.fetch_stock_data(
                        symbol, start_date, end_date
                    )
                
                if data is not None and not data.empty:
                    self.downloaded_symbols.add(symbol)
                    if symbol in self.failed_symbols:
                        self.failed_symbols.remove(symbol)
                    self.downloaded_count += 1
                    return data
                else:
                    self.failed_symbols.add(symbol)
                    self.failed_count += 1
                    return None
                    
            except Exception as e:
                logger.error(f"Error downloading {symbol}: {str(e)}")
                self.failed_symbols.add(symbol)
                self.failed_count += 1
                return None
    
    async def download_batch(
        self,
        symbols: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = "max"
    ) -> List[pd.DataFrame]:
        """
        Download data for a batch of symbols concurrently.
        
        Args:
            symbols: List of stock ticker symbols
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            period: Period string
        
        Returns:
            List of DataFrames with stock data
        """
        tasks = [
            self.download_single_symbol(symbol, start_date, end_date, period)
            for symbol in symbols
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out None and exceptions
        dataframes = [
            df for df in results
            if isinstance(df, pd.DataFrame) and not df.empty
        ]
        
        return dataframes
    
    async def save_dataframe(
        self,
        df: pd.DataFrame,
        symbol: str,
        format: str = None
    ):
        """Save a DataFrame to disk."""
        format = format or settings.output_format
        output_dir = Path(settings.output_dir)
        
        if format == "parquet":
            filepath = output_dir / f"{symbol}.parquet"
            df.to_parquet(filepath, index=False, compression='snappy')
        elif format == "csv":
            filepath = output_dir / f"{symbol}.csv"
            df.to_csv(filepath, index=False)
        elif format == "json":
            filepath = output_dir / f"{symbol}.json"
            df.to_json(filepath, orient='records', date_format='iso')
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        logger.debug(f"Saved {symbol} to {filepath}")
    
    async def download_and_save(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = "max"
    ):
        """Download and save data for a single symbol."""
        data = await self.download_single_symbol(
            symbol, start_date, end_date, period
        )
        if data is not None:
            await self.save_dataframe(data, symbol)
            return True
        return False
    
    async def download_massive(
        self,
        symbols: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = "max",
        target_count: int = 10_000_000
    ):
        """
        Download massive amounts of stock data.
        
        Args:
            symbols: List of stock ticker symbols
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            period: Period string
            target_count: Target number of data records to download
        """
        logger.info(f"Starting massive download: target {target_count:,} records")
        logger.info(f"Total symbols: {len(symbols):,}")
        logger.info(f"Batch size: {settings.batch_size}")
        logger.info(f"Max concurrent requests: {settings.max_concurrent_requests}")
        
        # Process in batches
        total_batches = (len(symbols) + settings.batch_size - 1) // settings.batch_size
        current_records = 0
        
        with tqdm(total=len(symbols), desc="Downloading symbols") as pbar:
            for batch_idx in range(0, len(symbols), settings.batch_size):
                batch = symbols[batch_idx:batch_idx + settings.batch_size]
                
                # Create semaphore to limit concurrent requests
                semaphore = asyncio.Semaphore(settings.max_concurrent_requests)
                
                async def download_with_semaphore(symbol):
                    async with semaphore:
                        return await self.download_and_save(
                            symbol, start_date, end_date, period
                        )
                
                # Download batch
                tasks = [download_with_semaphore(symbol) for symbol in batch]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Count successful downloads
                successful = sum(1 for r in results if r is True)
                pbar.update(len(batch))
                
                # Save progress periodically
                if batch_idx % (settings.batch_size * 10) == 0:
                    self.save_progress()
                
                # Check if we've reached target
                # Estimate: average records per symbol (rough estimate)
                # This is approximate - actual count would require reading saved files
                current_records += successful * 2500  # Rough estimate
                if current_records >= target_count:
                    logger.info(f"Reached target count: {current_records:,} records")
                    break
        
        self.save_progress()
        
        logger.info(f"Download complete!")
        logger.info(f"Successfully downloaded: {self.downloaded_count:,} symbols")
        logger.info(f"Failed: {self.failed_count:,} symbols")
        logger.info(f"Data saved to: {settings.output_dir}")
