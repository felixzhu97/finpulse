import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Portfolio,
  gainLossCellClass,
  formatPortfolioPrice,
  formatMarketValue,
  formatGainLoss,
  formatGainLossPercent,
  formatAllocation,
  portfolioColumnDefs,
  portfolioRowData,
} from './Portfolio';

describe('Portfolio', () => {
  it('should render the Portfolio title', () => {
    render(<Portfolio />);
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });

  it('should render the description', () => {
    render(<Portfolio />);
    expect(screen.getByText('View your complete investment portfolio')).toBeInTheDocument();
  });

  it('should render the Card component', () => {
    render(<Portfolio />);
    const card = screen.getByText('Portfolio').closest('.glass');
    expect(card).toBeInTheDocument();
  });

  it('should render AG Grid component', () => {
    render(<Portfolio />);
    const agGrid = document.querySelector('.ag-theme-quartz-dark');
    expect(agGrid).toBeInTheDocument();
  });

  it('should render the grid with proper theme class', () => {
    render(<Portfolio />);
    const grid = document.querySelector('.ag-theme-quartz-dark.ag-robinhood');
    expect(grid).toBeInTheDocument();
  });

  it('should have CardContent with proper styling', () => {
    render(<Portfolio />);
    const card = document.querySelector('.glass');
    expect(card).toBeInTheDocument();
  });

  it('should render grid with animation enabled', () => {
    render(<Portfolio />);
    const grid = document.querySelector('.ag-theme-quartz-dark');
    expect(grid).toBeInTheDocument();
  });
});

describe('gainLossCellClass', () => {
  it('should return positive classes for positive gain', () => {
    expect(gainLossCellClass(100)).toBe('cell-accent cell-font-semibold');
  });

  it('should return negative classes for negative loss', () => {
    expect(gainLossCellClass(-50)).toBe('cell-destructive cell-font-semibold');
  });

  it('should return positive classes for zero gain', () => {
    expect(gainLossCellClass(0)).toBe('cell-accent cell-font-semibold');
  });

  it('should return empty string for undefined value', () => {
    expect(gainLossCellClass(undefined)).toBe('');
  });
});

describe('formatPortfolioPrice', () => {
  it('should format price with yen symbol', () => {
    expect(formatPortfolioPrice(182.52)).toBe('¥182.52');
  });

  it('should return empty string for null value', () => {
    expect(formatPortfolioPrice(null)).toBe('');
  });

  it('should return empty string for undefined value', () => {
    expect(formatPortfolioPrice(undefined)).toBe('');
  });
});

describe('formatMarketValue', () => {
  it('should format market value with yen symbol', () => {
    expect(formatMarketValue(9126)).toBe('¥9126.00');
  });

  it('should return empty string for null value', () => {
    expect(formatMarketValue(null)).toBe('');
  });

  it('should return empty string for undefined value', () => {
    expect(formatMarketValue(undefined)).toBe('');
  });
});

describe('formatGainLoss', () => {
  it('should format positive gain with plus sign', () => {
    expect(formatGainLoss(366)).toBe('+¥366.00');
  });

  it('should format negative loss with minus sign', () => {
    expect(formatGainLoss(-100)).toBe('¥-100.00');
  });

  it('should return empty string for null value', () => {
    expect(formatGainLoss(null)).toBe('');
  });

  it('should return empty string for undefined value', () => {
    expect(formatGainLoss(undefined)).toBe('');
  });
});

describe('formatGainLossPercent', () => {
  it('should format positive percent with plus sign', () => {
    expect(formatGainLossPercent(4.18)).toBe('+4.18%');
  });

  it('should format negative percent with minus sign', () => {
    expect(formatGainLossPercent(-2.5)).toBe('-2.50%');
  });

  it('should return empty string for null value', () => {
    expect(formatGainLossPercent(null)).toBe('');
  });

  it('should return empty string for undefined value', () => {
    expect(formatGainLossPercent(undefined)).toBe('');
  });
});

describe('formatAllocation', () => {
  it('should format allocation with percent symbol', () => {
    expect(formatAllocation(18.5)).toBe('18.5%');
  });

  it('should return empty string for null value', () => {
    expect(formatAllocation(null)).toBe('');
  });

  it('should return empty string for undefined value', () => {
    expect(formatAllocation(undefined)).toBe('');
  });
});

describe('portfolioRowData', () => {
  it('should contain portfolio records', () => {
    expect(portfolioRowData.length).toBe(7);
  });

  it('should have correct data structure', () => {
    const first = portfolioRowData[0];
    expect(first.symbol).toBe('AAPL');
    expect(first.name).toBe('Apple Inc.');
    expect(first.sector).toBe('Technology');
  });
});

describe('portfolioColumnDefs', () => {
  it('should have column definitions', () => {
    expect(portfolioColumnDefs.length).toBeGreaterThan(0);
  });

  it('should have symbol column with pinned left', () => {
    const symbolCol = portfolioColumnDefs.find((c) => c.field === 'symbol');
    expect(symbolCol).toBeDefined();
    expect(symbolCol?.pinned).toBe('left');
  });

  it('should have gain/loss column with cellClass function', () => {
    const gainLossCol = portfolioColumnDefs.find((c) => c.field === 'gainLoss');
    expect(gainLossCol).toBeDefined();
    expect(gainLossCol?.cellClass).toBeDefined();
  });
});
