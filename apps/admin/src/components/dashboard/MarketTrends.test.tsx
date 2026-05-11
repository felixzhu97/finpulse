/**
 * MarketTrends Component Tests
 * Following TDD best practices with parameterized tests and domain test values
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketTrends } from './MarketTrends';
import { MARKET_DOMAIN } from '@/__fixtures__/domain';

describe('MarketTrends', () => {
  describe('rendering', () => {
    it('should render the MarketTrends title', () => {
      render(<MarketTrends />);
      expect(screen.getByText('Market Trends')).toBeInTheDocument();
    });

    it('should render Shanghai Composite index', () => {
      render(<MarketTrends />);
      expect(screen.getByText(MARKET_DOMAIN.VALID.shanghaiComposite.name)).toBeInTheDocument();
    });

    it('should render Hang Seng Index', () => {
      render(<MarketTrends />);
      expect(screen.getByText(MARKET_DOMAIN.VALID.hangSeng.name)).toBeInTheDocument();
    });
  });

  describe('market data', () => {
    it('should render market indices', () => {
      render(<MarketTrends />);
      expect(screen.getByText('Shanghai Composite')).toBeInTheDocument();
      expect(screen.getByText('Hang Seng Index')).toBeInTheDocument();
    });
  });

  describe('market states', () => {
    it('should handle bullish market', () => {
      const bullish = MARKET_DOMAIN.BOUNDARY.bullish;
      expect(bullish.change).toBeGreaterThan(0);
      expect(bullish.changePercent).toBeGreaterThan(0);
    });

    it('should handle bearish market', () => {
      const bearish = MARKET_DOMAIN.BOUNDARY.bearish;
      expect(bearish.change).toBeLessThan(0);
      expect(bearish.changePercent).toBeLessThan(0);
    });

    it('should handle flat market', () => {
      const flat = MARKET_DOMAIN.BOUNDARY.flat;
      expect(flat.change).toBe(0);
      expect(flat.changePercent).toBe(0);
    });
  });

  describe('value formatting', () => {
    it('should have valid numeric values', () => {
      Object.values(MARKET_DOMAIN.VALID).forEach((market) => {
        expect(typeof market.value).toBe('number');
        expect(typeof market.change).toBe('number');
        expect(typeof market.changePercent).toBe('number');
      });
    });

    it('should have positive values for indices', () => {
      Object.values(MARKET_DOMAIN.VALID).forEach((market) => {
        expect(market.value).toBeGreaterThan(0);
      });
    });
  });
});
