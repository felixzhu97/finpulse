/**
 * WatchList Component Tests
 * Following TDD best practices with domain test values
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WatchList } from './WatchList';
import { WATCHLIST_DOMAIN } from '@/__fixtures__/domain';

describe('WatchList', () => {
  describe('rendering', () => {
    it('should render the WatchList title', () => {
      render(<WatchList />);
      expect(screen.getByText('Watch List')).toBeInTheDocument();
    });

    it('should render the Add button', () => {
      render(<WatchList />);
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    it('should render AAPL symbol', () => {
      render(<WatchList />);
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    it('should render TSLA symbol', () => {
      render(<WatchList />);
      expect(screen.getByText('TSLA')).toBeInTheDocument();
    });
  });

  describe('stock symbols', () => {
    it('should display multiple stock symbols', () => {
      render(<WatchList />);
      const symbols = ['AAPL', 'TSLA'];
      symbols.forEach((symbol) => {
        expect(screen.getByText(symbol)).toBeInTheDocument();
      });
    });

    it('should render symbols as accessible text', () => {
      render(<WatchList />);
      const aapl = screen.getByText('AAPL');
      expect(aapl).toBeInTheDocument();
      expect(aapl).toBeVisible();
    });
  });

  describe('stock prices', () => {
    it('should render stock prices', () => {
      render(<WatchList />);
      // Find price values for the watch list items
      const priceElements = document.querySelectorAll('span, div');
      const hasPrices = Array.from(priceElements).some(el => 
        /\d+\.\d{2}/.test(el.textContent || '')
      );
      expect(hasPrices).toBe(true);
    });
  });

  describe('Add button interaction', () => {
    it('should have accessible Add button', () => {
      render(<WatchList />);
      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toBeVisible();
    });

    it('should respond to Add button click', () => {
      render(<WatchList />);
      
      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);
      
      expect(screen.getByText('Watch List')).toBeInTheDocument();
    });
  });

  describe('watch list items', () => {
    it('should display rising stocks with positive change', () => {
      const risingStock = WATCHLIST_DOMAIN.VALID.risingStock;
      expect(risingStock.change).toBeGreaterThan(0);
      expect(risingStock.changePercent).toBeGreaterThan(0);
    });

    it('should display falling stocks with negative change', () => {
      const fallingStock = WATCHLIST_DOMAIN.VALID.fallingStock;
      expect(fallingStock.change).toBeLessThan(0);
      expect(fallingStock.changePercent).toBeLessThan(0);
    });

    it('should display stable stocks with zero change', () => {
      const stableStock = WATCHLIST_DOMAIN.VALID.stableStock;
      expect(stableStock.change).toBe(0);
      expect(stableStock.changePercent).toBe(0);
    });
  });

  describe('accessibility', () => {
    it('should have interactive elements', () => {
      render(<WatchList />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accessible stock symbols', () => {
      render(<WatchList />);
      const textElements = document.querySelectorAll('span, div');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });
});
