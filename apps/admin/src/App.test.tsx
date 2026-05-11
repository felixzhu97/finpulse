/**
 * App Component Tests
 * Following TDD best practices with integration testing
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  describe('sidebar rendering', () => {
    it('should render the Sidebar with FinPulse logo', () => {
      render(<App />);
      expect(screen.getByText('FinPulse')).toBeInTheDocument();
    });

    it('should render navigation items', () => {
      render(<App />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
    });

    it('should render Sidebar as an accessible element', () => {
      render(<App />);
      const aside = document.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });
  });

  describe('header rendering', () => {
    it('should render the search input', () => {
      render(<App />);
      expect(screen.getByPlaceholderText('Search stocks, funds, assets...')).toBeInTheDocument();
    });

    it('should render search input with accessible placeholder', () => {
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search stocks, funds, assets...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toBeVisible();
    });
  });

  describe('main layout', () => {
    it('should render main content area', () => {
      render(<App />);
      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('should render header component', () => {
      render(<App />);
      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should render all main navigation items', () => {
      render(<App />);
      const navItems = ['Dashboard', 'Portfolio', 'Transactions', 'Clients'];
      navItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('should render navigation with accessible structure', () => {
      render(<App />);
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('integration', () => {
    it('should render all main components together', () => {
      render(<App />);
      
      // Header components
      expect(screen.getByPlaceholderText('Search stocks, funds, assets...')).toBeInTheDocument();
      
      // Sidebar components
      expect(screen.getByText('FinPulse')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      
      // Layout structure
      expect(document.querySelector('aside')).toBeInTheDocument();
      expect(document.querySelector('header')).toBeInTheDocument();
    });
  });
});
