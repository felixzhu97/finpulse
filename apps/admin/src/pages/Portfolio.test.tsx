/**
 * Portfolio Page Tests
 * Following TDD best practices with parameterized tests and domain test values
 */
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
import {
  PORTFOLIO_DOMAIN,
} from '@/__fixtures__/domain';

describe('Portfolio', () => {
  describe('page rendering', () => {
    it('should render the Portfolio title', () => {
      render(<Portfolio />);
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
    });

    it('should render the description', () => {
      render(<Portfolio />);
      expect(screen.getByText('View your complete investment portfolio')).toBeInTheDocument();
    });

    it('should render Card component with glass styling', () => {
      render(<Portfolio />);
      const card = screen.getByText('Portfolio').closest('.glass');
      expect(card).toBeInTheDocument();
    });

    it('should render AG Grid component', () => {
      render(<Portfolio />);
      const agGrid = document.querySelector('.ag-theme-quartz-dark');
      expect(agGrid).toBeInTheDocument();
    });

    it('should render AG Grid with robinhood theme', () => {
      render(<Portfolio />);
      const grid = document.querySelector('.ag-theme-quartz-dark.ag-robinhood');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('gainLossCellClass', () => {
    it.each([
      { value: 100, expectedClass: 'cell-accent cell-font-semibold' },
      { value: 0, expectedClass: 'cell-accent cell-font-semibold' },
      { value: -50, expectedClass: 'cell-destructive cell-font-semibold' },
    ])('should return "$expectedClass" for value $value', ({ value, expectedClass }) => {
      expect(gainLossCellClass(value)).toBe(expectedClass);
    });

    it('should return empty string for undefined value', () => {
      expect(gainLossCellClass(undefined)).toBe('');
    });
  });

  describe('formatPortfolioPrice', () => {
    it.each([
      { value: 182.52, expected: '¥182.52' },
      { value: 100, expected: '¥100.00' },
      { value: 0.99, expected: '¥0.99' },
    ])('should format $value to "$expected"', ({ value, expected }) => {
      expect(formatPortfolioPrice(value)).toBe(expected);
    });

    it.each([null, undefined])('should return empty string for %s value', (value) => {
      expect(formatPortfolioPrice(value)).toBe('');
    });
  });

  describe('formatMarketValue', () => {
    it.each([
      { value: 9126, expected: '¥9126.00' },
      { value: 1000, expected: '¥1000.00' },
      { value: 0.5, expected: '¥0.50' },
    ])('should format $value to "$expected"', ({ value, expected }) => {
      expect(formatMarketValue(value)).toBe(expected);
    });

    it.each([null, undefined])('should return empty string for %s value', (value) => {
      expect(formatMarketValue(value)).toBe('');
    });
  });

  describe('formatGainLoss', () => {
    it.each([
      { value: 366, expected: '+¥366.00' },
      { value: 0, expected: '+¥0.00' },
      { value: -100, expected: '¥-100.00' },
    ])('should format $value to "$expected"', ({ value, expected }) => {
      expect(formatGainLoss(value)).toBe(expected);
    });

    it.each([null, undefined])('should return empty string for %s value', (value) => {
      expect(formatGainLoss(value)).toBe('');
    });
  });

  describe('formatGainLossPercent', () => {
    it.each([
      { value: 4.18, expected: '+4.18%' },
      { value: 0, expected: '+0.00%' },
      { value: -2.5, expected: '-2.50%' },
    ])('should format $value to "$expected"', ({ value, expected }) => {
      expect(formatGainLossPercent(value)).toBe(expected);
    });

    it.each([null, undefined])('should return empty string for %s value', (value) => {
      expect(formatGainLossPercent(value)).toBe('');
    });
  });

  describe('formatAllocation', () => {
    it.each([
      { value: 18.5, expected: '18.5%' },
      { value: 100, expected: '100.0%' },
      { value: 0, expected: '0.0%' },
    ])('should format $value to "$expected"', ({ value, expected }) => {
      expect(formatAllocation(value)).toBe(expected);
    });

    it.each([null, undefined])('should return empty string for %s value', (value) => {
      expect(formatAllocation(value)).toBe('');
    });
  });

  describe('portfolioRowData', () => {
    it('should contain portfolio records', () => {
      expect(portfolioRowData.length).toBeGreaterThan(0);
    });

    it('should have correct data structure for first record', () => {
      const first = portfolioRowData[0];
      expect(first).toHaveProperty('symbol');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('sector');
      expect(first).toHaveProperty('marketValue');
      expect(first).toHaveProperty('gainLoss');
    });

    it('should have valid sector values', () => {
      portfolioRowData.forEach((holding) => {
        expect(typeof holding.sector).toBe('string');
      });
    });

    it('should have numeric values for calculations', () => {
      portfolioRowData.forEach((holding) => {
        expect(typeof holding.marketValue).toBe('number');
        expect(typeof holding.gainLoss).toBe('number');
        expect(typeof holding.gainLossPercent).toBe('number');
      });
    });
  });

  describe('portfolioColumnDefs', () => {
    it('should have column definitions', () => {
      expect(portfolioColumnDefs.length).toBeGreaterThan(0);
    });

    it('should have symbol column pinned left', () => {
      const symbolCol = portfolioColumnDefs.find((c) => c.field === 'symbol');
      expect(symbolCol).toBeDefined();
      expect(symbolCol?.pinned).toBe('left');
    });

    it('should have gain/loss column with cellClass function', () => {
      const gainLossCol = portfolioColumnDefs.find((c) => c.field === 'gainLoss');
      expect(gainLossCol).toBeDefined();
      expect(typeof gainLossCol?.cellClass).toBe('function');
    });

    it('should have all required fields', () => {
      const requiredFields = ['symbol', 'name', 'sector', 'quantity', 'avgPrice', 'currentPrice', 'marketValue', 'costBasis', 'gainLoss', 'gainLossPercent', 'allocation'];
      requiredFields.forEach((field) => {
        expect(portfolioColumnDefs.find((c) => c.field === field)).toBeDefined();
      });
    });
  });

  describe('boundary value tests', () => {
    it('should handle zero gain/loss correctly', () => {
      expect(gainLossCellClass(0)).toBe(PORTFOLIO_DOMAIN.BOUNDARY.zeroGain.gainLoss >= 0 ? 'cell-accent cell-font-semibold' : 'cell-destructive cell-font-semibold');
    });

    it('should handle maximum allocation', () => {
      const holding = PORTFOLIO_DOMAIN.BOUNDARY.maxAllocation;
      expect(formatAllocation(holding.allocation)).toBe('100.0%');
    });
  });
});
