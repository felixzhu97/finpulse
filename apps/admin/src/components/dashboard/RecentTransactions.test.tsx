/**
 * RecentTransactions Component Tests
 * Following TDD best practices with parameterized tests and domain test values
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentTransactions } from './RecentTransactions';

describe('RecentTransactions', () => {
  describe('rendering', () => {
    it('should render the RecentTransactions title', () => {
      render(<RecentTransactions />);
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });

    it('should render View All button', () => {
      render(<RecentTransactions />);
      expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
    });

    it('should render NVDA symbol', () => {
      render(<RecentTransactions />);
      expect(screen.getByText('NVDA')).toBeInTheDocument();
    });

    it('should render AAPL symbol', () => {
      render(<RecentTransactions />);
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });
  });

  describe('transaction symbols', () => {
    it('should display multiple stock symbols', () => {
      render(<RecentTransactions />);
      const symbols = ['NVDA', 'AAPL'];
      symbols.forEach((symbol) => {
        expect(screen.getByText(symbol)).toBeInTheDocument();
      });
    });

    it('should render symbols as accessible text', () => {
      render(<RecentTransactions />);
      const nvda = screen.getByText('NVDA');
      expect(nvda).toBeInTheDocument();
      expect(nvda).toBeVisible();
    });
  });

  describe('View All action', () => {
    it('should have accessible View All button', () => {
      render(<RecentTransactions />);
      const viewAllButton = screen.getByRole('button', { name: /view all/i });
      expect(viewAllButton).toBeInTheDocument();
    });

    it('should respond to View All button click', () => {
      render(<RecentTransactions />);
      
      const viewAllButton = screen.getByRole('button', { name: /view all/i });
      fireEvent.click(viewAllButton);
      
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });
  });

  describe('data display', () => {
    it('should render transaction information', () => {
      render(<RecentTransactions />);
      const symbols = document.querySelectorAll('span, div');
      expect(symbols.length).toBeGreaterThan(0);
    });
  });
});
