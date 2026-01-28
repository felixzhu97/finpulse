"""Main entry point for stock data downloader."""
import asyncio
import argparse
import logging
from pathlib import Path
from datetime import datetime, timedelta

from downloader import StockDataDownloader
from symbol_lists import (
    get_all_us_symbols,
    get_sp500_symbols,
    load_symbols_from_file,
    save_symbols_to_file
)
from config import settings

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def main():
    """Main function."""
    parser = argparse.ArgumentParser(
        description='Download stock market data at scale'
    )
    parser.add_argument(
        '--symbols',
        type=str,
        help='Comma-separated list of symbols or path to file with symbols'
    )
    parser.add_argument(
        '--count',
        type=int,
        default=10_000_000,
        help='Target number of data records (default: 10,000,000)'
    )
    parser.add_argument(
        '--start-date',
        type=str,
        help='Start date (YYYY-MM-DD)'
    )
    parser.add_argument(
        '--end-date',
        type=str,
        help='End date (YYYY-MM-DD)'
    )
    parser.add_argument(
        '--period',
        type=str,
        default='max',
        help='Period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max (default: max)'
    )
    parser.add_argument(
        '--source',
        type=str,
        choices=['sp500', 'all_us', 'file', 'custom'],
        default='all_us',
        help='Symbol source (default: all_us)'
    )
    parser.add_argument(
        '--symbol-file',
        type=str,
        help='Path to file containing symbols (one per line)'
    )
    parser.add_argument(
        '--save-symbols',
        type=str,
        help='Save symbol list to file before downloading'
    )
    
    args = parser.parse_args()
    
    # Get symbols
    symbols = []
    
    if args.symbols:
        if Path(args.symbols).exists():
            # It's a file path
            symbols = load_symbols_from_file(args.symbols)
        else:
            # It's a comma-separated list
            symbols = [s.strip().upper() for s in args.symbols.split(',')]
    elif args.source == 'sp500':
        symbols = get_sp500_symbols()
    elif args.source == 'all_us':
        symbols = get_all_us_symbols()
    elif args.source == 'file':
        if not args.symbol_file:
            logger.error("--symbol-file required when using --source file")
            return
        symbols = load_symbols_from_file(args.symbol_file)
    elif args.source == 'custom':
        if not args.symbols:
            logger.error("--symbols required when using --source custom")
            return
        symbols = [s.strip().upper() for s in args.symbols.split(',')]
    
    if not symbols:
        logger.error("No symbols to download")
        return
    
    logger.info(f"Loaded {len(symbols):,} symbols")
    
    # Save symbols if requested
    if args.save_symbols:
        save_symbols_to_file(symbols, args.save_symbols)
        logger.info(f"Saved symbols to {args.save_symbols}")
    
    # Create downloader
    downloader = StockDataDownloader()
    
    # Start download
    await downloader.download_massive(
        symbols=symbols,
        start_date=args.start_date,
        end_date=args.end_date,
        period=args.period,
        target_count=args.count
    )
    
    logger.info("Download complete!")


if __name__ == "__main__":
    asyncio.run(main())
