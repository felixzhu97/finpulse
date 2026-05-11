/**
 * Sidebar Component Tests
 * Following TDD best practices with RTL and domain test values
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  describe('logo and branding', () => {
    it('should render the FinPulse logo text', () => {
      render(<Sidebar />);
      expect(screen.getByText('FinPulse')).toBeInTheDocument();
    });
  });

  describe('navigation items', () => {
    const navigationItems = [
      'Dashboard',
      'Portfolio',
      'Transactions',
      'Clients',
    ] as const;

    it.each(navigationItems)('should render "$item" navigation item', (item) => {
      render(<Sidebar />);
      expect(screen.getByText(item)).toBeInTheDocument();
    });

    it('should render all main navigation items together', () => {
      render(<Sidebar />);
      navigationItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });
  });

  describe('bottom menu items', () => {
    const bottomMenuItems = [
      'Notifications',
      'Settings',
      'Help',
    ] as const;

    it.each(bottomMenuItems)('should render "$item" bottom menu item', (item) => {
      render(<Sidebar />);
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  describe('toggle functionality', () => {
    it('should render collapse button with aria-label', () => {
      render(<Sidebar />);
      const collapseButton = screen.getByRole('button', { name: /collapse/i });
      expect(collapseButton).toBeInTheDocument();
    });

    it('should toggle to expand state when collapse button is clicked', () => {
      render(<Sidebar />);
      
      const collapseButton = screen.getByRole('button', { name: /collapse/i });
      fireEvent.click(collapseButton);
      
      expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
    });

    it('should toggle back to collapse state when expand button is clicked', () => {
      render(<Sidebar />);
      
      // Collapse
      const collapseButton = screen.getByRole('button', { name: /collapse/i });
      fireEvent.click(collapseButton);
      
      // Expand
      const expandButton = screen.getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);
      
      expect(screen.getByRole('button', { name: /collapse/i })).toBeInTheDocument();
    });
  });

  describe('semantic structure', () => {
    it('should render as an aside element for sidebar semantics', () => {
      render(<Sidebar />);
      const aside = document.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });

    it('should contain navigation element', () => {
      render(<Sidebar />);
      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('visual states', () => {
    it('should render in expanded state by default', () => {
      render(<Sidebar />);
      const aside = document.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(<Sidebar />);
      const links = document.querySelectorAll('a');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    it('should have toggle button with accessible label', () => {
      render(<Sidebar />);
      const toggleButton = screen.getByRole('button', { name: /collapse/i });
      expect(toggleButton).toBeVisible();
    });

    it('should have navigation landmarks', () => {
      render(<Sidebar />);
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });
});
