"""Simple test script to verify the downloader works."""
import sys

def test_imports():
    """Test if all required modules can be imported."""
    print("Testing imports...")
    
    try:
        import yfinance
        print("✓ yfinance")
    except ImportError as e:
        print(f"✗ yfinance: {e}")
        return False
    
    try:
        import pandas
        print("✓ pandas")
    except ImportError as e:
        print(f"✗ pandas: {e}")
        return False
    
    try:
        import aiohttp
        print("✓ aiohttp")
    except ImportError as e:
        print(f"✗ aiohttp: {e}")
        return False
    
    try:
        import tqdm
        print("✓ tqdm")
    except ImportError as e:
        print(f"✗ tqdm: {e}")
        return False
    
    try:
        import pyarrow
        print("✓ pyarrow")
    except ImportError as e:
        print(f"✗ pyarrow: {e}")
        return False
    
    try:
        from config import settings
        print("✓ config")
    except ImportError as e:
        print(f"✗ config: {e}")
        return False
    
    try:
        from data_sources import YahooFinanceAdapter
        print("✓ data_sources")
    except ImportError as e:
        print(f"✗ data_sources: {e}")
        return False
    
    try:
        from downloader import StockDataDownloader
        print("✓ downloader")
    except ImportError as e:
        print(f"✗ downloader: {e}")
        return False
    
    print("\nAll imports successful!")
    return True


def test_basic_download():
    """Test a basic download."""
    print("\nTesting basic download...")
    
    try:
        import asyncio
        from downloader import StockDataDownloader
        
        async def test():
            downloader = StockDataDownloader()
            result = await downloader.download_single_symbol("AAPL", period="5d")
            if result is not None and not result.empty:
                print(f"✓ Successfully downloaded AAPL data: {len(result)} rows")
                print(f"  Columns: {list(result.columns)}")
                return True
            else:
                print("✗ Failed to download data")
                return False
        
        return asyncio.run(test())
    except Exception as e:
        print(f"✗ Error during download test: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Stock Data Downloader - Simple Test")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import test failed. Please install dependencies.")
        print("See INSTALL.md for installation instructions.")
        sys.exit(1)
    
    # Test basic download
    if not test_basic_download():
        print("\n❌ Download test failed.")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("✅ All tests passed!")
    print("=" * 50)
    print("\nYou can now run the full downloader:")
    print("  python main.py --count 10000000")
