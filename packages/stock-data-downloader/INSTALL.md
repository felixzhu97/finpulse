# Installation Guide

## Manual Installation

If you encounter network issues during automatic installation, follow these steps:

### 1. Install Dependencies

```bash
# Activate virtual environment
source venv/bin/activate

# Install packages one by one (if batch install fails)
pip install yfinance
pip install pandas
pip install pyarrow
pip install tqdm
pip install python-dotenv
pip install aiohttp
pip install asyncio-throttle
pip install tenacity
pip install aiofiles
pip install pydantic
pip install pydantic-settings
pip install alpha-vantage
```

### 2. Alternative: Use pip with different index

```bash
pip install -r requirements.txt -i https://pypi.org/simple
```

### 3. Or install without version constraints

Edit `requirements.txt` to remove version numbers, then:
```bash
pip install -r requirements.txt
```

### 4. Verify Installation

```bash
python3 -c "import yfinance, pandas, aiohttp, tqdm; print('All packages installed successfully!')"
```

## Troubleshooting

### Network Issues
- Check your internet connection
- Try using a VPN if behind a firewall
- Use a different pip index: `pip install -i https://pypi.org/simple <package>`

### Permission Issues
- Use `pip install --user` to install in user directory
- Or fix permissions: `sudo chown -R $(whoami) ~/Library/Caches/pip`

### Python Version
- Requires Python 3.7+
- Check version: `python3 --version`
