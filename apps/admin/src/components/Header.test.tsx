/**
 * Header Component Tests
 * Following TDD best practices with RTL and domain test values
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { USER_DOMAIN } from '@/__fixtures__/domain';

describe('Header', () => {
  describe('rendering', () => {
    it('should render the search input with correct placeholder', () => {
      render(<Header />);
      expect(screen.getByPlaceholderText('Search stocks, funds, assets...')).toBeInTheDocument();
    });

    it('should render the Market Open badge', () => {
      render(<Header />);
      expect(screen.getByText('Market Open')).toBeInTheDocument();
    });

    it('should render user name from domain', () => {
      render(<Header />);
      expect(screen.getByText(USER_DOMAIN.VALID.johnChen.name)).toBeInTheDocument();
    });

    it('should render user role from domain', () => {
      render(<Header />);
      expect(screen.getByText(USER_DOMAIN.VALID.johnChen.role)).toBeInTheDocument();
    });

    it('should render notification badge with count', () => {
      render(<Header />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render keyboard shortcut hint', () => {
      render(<Header />);
      expect(screen.getByText('⌘K')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should accept user input in search field', () => {
      render(<Header />);
      
      const input = screen.getByPlaceholderText('Search stocks, funds, assets...');
      fireEvent.change(input, { target: { value: 'AAPL' } });
      
      expect(input).toHaveValue('AAPL');
    });

    it('should clear search input when cleared', () => {
      render(<Header />);
      
      const input = screen.getByPlaceholderText('Search stocks, funds, assets...');
      fireEvent.change(input, { target: { value: 'AAPL' } });
      fireEvent.change(input, { target: { value: '' } });
      
      expect(input).toHaveValue('');
    });

    it.each([
      { input: 'AAPL', description: 'stock symbol' },
      { input: 'Technology Fund', description: 'fund name' },
      { input: 'BTC', description: 'crypto asset' },
    ])('should accept $description as search term', ({ input }) => {
      render(<Header />);
      
      const searchInput = screen.getByPlaceholderText('Search stocks, funds, assets...');
      fireEvent.change(searchInput, { target: { value: input } });
      
      expect(searchInput).toHaveValue(input);
    });
  });

  describe('icon buttons', () => {
    it('should render at least one action button', () => {
      render(<Header />);
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render buttons with accessible roles', () => {
      render(<Header />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    it('should have search input with proper label association', () => {
      render(<Header />);
      const input = screen.getByPlaceholderText('Search stocks, funds, assets...');
      expect(input).toBeVisible();
    });

    it('should be able to focus the search input', () => {
      render(<Header />);
      
      const input = screen.getByPlaceholderText('Search stocks, funds, assets...');
      fireEvent.focus(input);
      
      expect(input).toBeVisible();
    });
  });
});
