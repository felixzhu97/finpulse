"""Utility functions for getting stock symbol lists."""
import logging
from typing import List, Set
import pandas as pd
import yfinance as yf

logger = logging.getLogger(__name__)


def get_sp500_symbols() -> List[str]:
    """Get S&P 500 stock symbols."""
    try:
        # Fetch S&P 500 list from Wikipedia
        url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
        tables = pd.read_html(url)
        sp500_table = tables[0]
        symbols = sp500_table['Symbol'].tolist()
        # Clean symbols (remove dots, convert to standard format)
        symbols = [s.replace('.', '-') for s in symbols]
        return symbols
    except Exception as e:
        logger.error(f"Error fetching S&P 500 symbols: {e}")
        return []


def get_nasdaq_symbols() -> List[str]:
    """Get NASDAQ stock symbols (sample - full list requires API or file)."""
    # Note: Full NASDAQ list requires downloading from NASDAQ website
    # or using a paid API. This is a placeholder.
    logger.warning("Full NASDAQ list not implemented - requires data source")
    return []


def get_nyse_symbols() -> List[str]:
    """Get NYSE stock symbols (sample - full list requires API or file)."""
    # Note: Full NYSE list requires downloading from NYSE website
    # or using a paid API. This is a placeholder.
    logger.warning("Full NYSE list not implemented - requires data source")
    return []


def get_all_us_symbols() -> List[str]:
    """Get all US stock symbols (combines major exchanges)."""
    symbols: Set[str] = set()
    
    # Add S&P 500
    sp500 = get_sp500_symbols()
    symbols.update(sp500)
    logger.info(f"Added {len(sp500)} S&P 500 symbols")
    
    # Add popular ETFs
    etfs = [
        'SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VOO', 'VEA', 'VWO',
        'AGG', 'BND', 'TLT', 'GLD', 'SLV', 'USO', 'UNG'
    ]
    symbols.update(etfs)
    
    # Add popular individual stocks
    popular_stocks = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA',
        'JPM', 'V', 'JNJ', 'WMT', 'PG', 'MA', 'UNH', 'HD', 'DIS',
        'BAC', 'ADBE', 'NFLX', 'CRM', 'PYPL', 'INTC', 'CMCSA',
        'PEP', 'TMO', 'COST', 'AVGO', 'CSCO', 'ABT', 'NKE'
    ]
    symbols.update(popular_stocks)
    
    return sorted(list(symbols))


def generate_extended_symbol_list(base_symbols: List[str], count: int = 10000) -> List[str]:
    """
    Generate an extended symbol list for massive downloads.
    
    This function creates variations and combinations to reach target count.
    For real use, you should download actual symbol lists from exchanges.
    
    Args:
        base_symbols: Base list of symbols
        count: Target number of symbols
    
    Returns:
        Extended list of symbols
    """
    symbols = list(base_symbols)
    
    # Add variations (this is a simplified approach)
    # In production, you'd want to fetch actual symbol lists
    logger.warning(
        f"Generating extended list - for production use, "
        f"download actual symbol lists from exchanges"
    )
    
    # Add numbered variations (not all will be valid, but downloader will handle failures)
    if len(symbols) < count:
        # Generate potential symbols (this is just an example)
        # Real implementation should use actual exchange listings
        for i in range(1000, 10000):
            potential_symbol = f"TEST{i}"
            if potential_symbol not in symbols:
                symbols.append(potential_symbol)
            if len(symbols) >= count:
                break
    
    return symbols[:count]


def load_symbols_from_file(filepath: str) -> List[str]:
    """Load symbols from a text file (one symbol per line)."""
    try:
        with open(filepath, 'r') as f:
            symbols = [line.strip().upper() for line in f if line.strip()]
        return symbols
    except Exception as e:
        logger.error(f"Error loading symbols from file: {e}")
        return []


def save_symbols_to_file(symbols: List[str], filepath: str):
    """Save symbols to a text file (one symbol per line)."""
    try:
        with open(filepath, 'w') as f:
            for symbol in symbols:
                f.write(f"{symbol}\n")
        logger.info(f"Saved {len(symbols)} symbols to {filepath}")
    except Exception as e:
        logger.error(f"Error saving symbols to file: {e}")
