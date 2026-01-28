"""Example usage of the stock data downloader."""
import asyncio
from downloader import StockDataDownloader
from symbol_lists import get_sp500_symbols, get_all_us_symbols

async def example_basic():
    """Basic example: download a few symbols."""
    print("Example 1: Downloading a few symbols...")
    downloader = StockDataDownloader()
    
    symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
    
    for symbol in symbols:
        success = await downloader.download_and_save(symbol, period="1y")
        if success:
            print(f"✓ Downloaded {symbol}")
        else:
            print(f"✗ Failed to download {symbol}")
    
    downloader.save_progress()
    print("Done!")


async def example_sp500():
    """Example: download S&P 500 stocks."""
    print("Example 2: Downloading S&P 500 stocks...")
    downloader = StockDataDownloader()
    
    symbols = get_sp500_symbols()
    print(f"Found {len(symbols)} S&P 500 symbols")
    
    # Download first 10 as example
    sample_symbols = symbols[:10]
    
    await downloader.download_massive(
        symbols=sample_symbols,
        period="1y",
        target_count=10000
    )
    
    print("Done!")


async def example_massive():
    """Example: massive download (10 million records)."""
    print("Example 3: Starting massive download (10M records)...")
    print("This will take a while...")
    
    downloader = StockDataDownloader()
    
    # Get all available symbols
    symbols = get_all_us_symbols()
    
    # For demonstration, limit to first 100 symbols
    # Remove this limit for full download
    symbols = symbols[:100]
    
    await downloader.download_massive(
        symbols=symbols,
        period="max",
        target_count=10_000_000
    )
    
    print("Done!")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        example = sys.argv[1]
        if example == "basic":
            asyncio.run(example_basic())
        elif example == "sp500":
            asyncio.run(example_sp500())
        elif example == "massive":
            asyncio.run(example_massive())
        else:
            print(f"Unknown example: {example}")
            print("Available examples: basic, sp500, massive")
    else:
        print("Usage: python example.py [basic|sp500|massive]")
        print("\nExamples:")
        print("  python example.py basic    - Download a few symbols")
        print("  python example.py sp500    - Download S&P 500 stocks")
        print("  python example.py massive  - Massive download (10M records)")
