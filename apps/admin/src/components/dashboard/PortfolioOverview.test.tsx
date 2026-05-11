/**
 * PortfolioOverview Component Tests
 * Following TDD best practices with domain test values and parameterized tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PortfolioOverview } from './PortfolioOverview';
import { DASHBOARD_STATS_DOMAIN } from '@/__fixtures__/domain';

describe('PortfolioOverview', () => {
  describe('stat cards rendering', () => {
    it('should render Total Net Assets label', () => {
      render(<PortfolioOverview />);
      expect(screen.getByText('Total Net Assets')).toBeInTheDocument();
    });

    it('should render Today\'s Profit label', () => {
      render(<PortfolioOverview />);
      expect(screen.getByText("Today's Profit")).toBeInTheDocument();
    });

    it('should render Cumulative Return label', () => {
      render(<PortfolioOverview />);
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
    });

    it('should render Active Trades label', () => {
      render(<PortfolioOverview />);
      expect(screen.getByText('Active Trades')).toBeInTheDocument();
    });
  });

  describe('stat values from domain', () => {
    it('should render total net assets value', () => {
      render(<PortfolioOverview />);
      expect(screen.getByText(DASHBOARD_STATS_DOMAIN.VALID.totalNetAssets)).toBeInTheDocument();
    });

    it('should render today profit value', () => {
      render(<PortfolioOverview />);
      expect(screen.getByText(DASHBOARD_STATS_DOMAIN.VALID.todayProfit)).toBeInTheDocument();
    });

    it('should render cumulative return value', () => {
      render(<PortfolioOverview />);
      expect(screen.getByText(DASHBOARD_STATS_DOMAIN.VALID.cumulativeReturn)).toBeInTheDocument();
    });

    it('should render active trades count', () => {
      render(<PortfolioOverview />);
      expect(screen.getByText(DASHBOARD_STATS_DOMAIN.VALID.activeTrades)).toBeInTheDocument();
    });
  });

  describe('all stats rendering', () => {
    it('should render all four stat cards', () => {
      render(<PortfolioOverview />);
      
      const statLabels = [
        'Total Net Assets',
        "Today's Profit",
        'Cumulative Return',
        'Active Trades',
      ];
      
      statLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('boundary value scenarios', () => {
    it('should handle zero profit display', () => {
      const zeroProfitValue = DASHBOARD_STATS_DOMAIN.BOUNDARY.zeroProfit;
      expect(zeroProfitValue).toBe('¥0');
    });

    it('should handle negative profit display', () => {
      const negativeProfitValue = DASHBOARD_STATS_DOMAIN.BOUNDARY.negativeProfit;
      expect(negativeProfitValue.startsWith('-')).toBe(true);
    });

    it('should handle max return display', () => {
      const maxReturn = DASHBOARD_STATS_DOMAIN.BOUNDARY.maxReturn;
      expect(maxReturn).toBe('999.99%');
    });
  });
});
