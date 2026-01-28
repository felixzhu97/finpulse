#!/bin/bash

# Quick start script for stock data downloader

echo "Stock Data Downloader - Quick Start"
echo "===================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file if you have API keys"
fi

# Create data directory
mkdir -p data

echo ""
echo "Setup complete!"
echo ""
echo "To start downloading 10 million stock records, run:"
echo "  python main.py --count 10000000"
echo ""
echo "For more options, see README.md"
