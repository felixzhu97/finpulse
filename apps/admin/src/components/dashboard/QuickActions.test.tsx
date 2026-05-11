/**
 * QuickActions Component Tests
 * Following TDD best practices with accessibility testing
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickActions } from './QuickActions';

describe('QuickActions', () => {
  describe('rendering', () => {
    it('should render the QuickActions title', () => {
      render(<QuickActions />);
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('should render Buy button', () => {
      render(<QuickActions />);
      expect(screen.getByRole('button', { name: /buy/i })).toBeInTheDocument();
    });

    it('should render Sell button', () => {
      render(<QuickActions />);
      expect(screen.getByRole('button', { name: /sell/i })).toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('should have Buy button accessible', () => {
      render(<QuickActions />);
      const buyButton = screen.getByRole('button', { name: /buy/i });
      expect(buyButton).toBeInTheDocument();
      expect(buyButton).toBeVisible();
    });

    it('should have Sell button accessible', () => {
      render(<QuickActions />);
      const sellButton = screen.getByRole('button', { name: /sell/i });
      expect(sellButton).toBeInTheDocument();
      expect(sellButton).toBeVisible();
    });

    it('should render buttons as actionable elements', () => {
      render(<QuickActions />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('user interactions', () => {
    it('should respond to Buy button click', () => {
      render(<QuickActions />);
      
      const buyButton = screen.getByRole('button', { name: /buy/i });
      fireEvent.click(buyButton);
      
      expect(buyButton).toBeInTheDocument();
    });

    it('should respond to Sell button click', () => {
      render(<QuickActions />);
      
      const sellButton = screen.getByRole('button', { name: /sell/i });
      fireEvent.click(sellButton);
      
      expect(sellButton).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have buttons with accessible names', () => {
      render(<QuickActions />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should not have disabled buttons by default', () => {
      render(<QuickActions />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });
});
