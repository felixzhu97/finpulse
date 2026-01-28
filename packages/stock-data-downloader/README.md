# Stock Data Downloader

High-performance Python tool for downloading massive amounts of stock market data (10+ million records).

## Features

- **Async/Concurrent Downloads**: Uses asyncio for high-performance parallel downloads
- **Multiple Data Sources**: Supports Yahoo Finance (free) and Alpha Vantage (with API key)
- **Efficient Storage**: Saves data in Parquet format for optimal performance
- **Progress Tracking**: Resume capability with progress file
- **Error Handling**: Automatic retries with exponential backoff
- **Rate Limiting**: Configurable request throttling to respect API limits
- **Batch Processing**: Processes symbols in configurable batches

## Installation

### Quick Start

```bash
# Option 1: Use the quick start script
./quick_start.sh

# Option 2: Manual installation
# Create virtual environment (if not exists)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# If you encounter network issues, try:
# pip install -r requirements.txt -i https://pypi.org/simple
# Or install packages individually (see INSTALL.md)

# Copy environment file
cp .env.example .env
# Edit .env if needed (optional API keys)
```

### Verify Installation

```bash
# Run test script
python3 test_simple.py
```

If the test fails, see `INSTALL.md` for troubleshooting.

## Usage

### Basic Usage

Download data for all US stocks (default):

```bash
python main.py --count 10000000
```

### Download Specific Symbols

```bash
python main.py --symbols "AAPL,MSFT,GOOGL" --count 1000000
```

### Download from File

Create a file `symbols.txt` with one symbol per line:
```
AAPL
MSFT
GOOGL
```

Then run:
```bash
python main.py --symbols symbols.txt --count 5000000
```

### Download S&P 500 Only

```bash
python main.py --source sp500 --count 5000000
```

### Specify Date Range

```bash
python main.py --start-date 2020-01-01 --end-date 2024-01-01 --count 10000000
```

### Specify Period

```bash
python main.py --period 5y --count 10000000
```

## Configuration

Edit `.env` file or environment variables:

```env
# API Keys (optional)
ALPHA_VANTAGE_API_KEY=your_api_key_here

# Download Configuration
MAX_CONCURRENT_REQUESTS=50      # Number of concurrent downloads
BATCH_SIZE=1000                  # Symbols per batch
RETRY_ATTEMPTS=3                 # Retry attempts for failed downloads
RETRY_DELAY=1                    # Initial retry delay (seconds)

# Data Storage
OUTPUT_DIR=./data                # Output directory
OUTPUT_FORMAT=parquet            # parquet, csv, or json

# Rate Limiting
REQUESTS_PER_SECOND=10           # API request rate limit
```

## Output Format

Data is saved in the specified format (default: Parquet) with the following columns:

- `Date`: Trading date
- `Open`: Opening price
- `High`: Highest price
- `Low`: Lowest price
- `Close`: Closing price
- `Volume`: Trading volume
- `Dividends`: Dividends
- `Stock Splits`: Stock splits
- `Symbol`: Stock ticker symbol

## Performance Tips

1. **Increase Concurrency**: For faster downloads, increase `MAX_CONCURRENT_REQUESTS` (but respect API limits)
2. **Use Parquet Format**: Parquet is more efficient than CSV for large datasets
3. **Resume Downloads**: The tool automatically saves progress and can resume interrupted downloads
4. **Batch Processing**: Adjust `BATCH_SIZE` based on available memory

## Data Sources

### Yahoo Finance (Default)
- Free, no API key required
- Good for historical data
- Rate limits apply (handled automatically)

### Alpha Vantage
- Requires API key (free tier available)
- More structured API
- Stricter rate limits (5 calls/min for free tier)

## Examples

### Download 10 Million Records

```bash
python main.py --count 10000000 --period max
```

### Download Last 5 Years for S&P 500

```bash
python main.py --source sp500 --period 5y --count 5000000
```

### Download Custom List with Date Range

```bash
python main.py \
  --symbols "AAPL,MSFT,GOOGL,AMZN,TSLA" \
  --start-date 2020-01-01 \
  --end-date 2024-12-31 \
  --count 100000
```

## Progress Tracking

The downloader automatically saves progress to `data/download_progress.json`. If the download is interrupted, it will skip already downloaded symbols when resumed.

## Troubleshooting

### Rate Limiting Errors
- Reduce `MAX_CONCURRENT_REQUESTS`
- Reduce `REQUESTS_PER_SECOND`
- Add delays between batches

### Memory Issues
- Reduce `BATCH_SIZE`
- Process symbols in smaller chunks
- Use Parquet format (more memory efficient)

### API Errors
- Check internet connection
- Verify symbol names are correct
- Some symbols may not have data available
- Check API rate limits

## License

Part of the fintech-project.
