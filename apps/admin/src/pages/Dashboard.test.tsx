/**
 * Dashboard Page Tests
 * Following TDD best practices with RTL, userEvent, and domain test values
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { DASHBOARD_STATS_DOMAIN } from '@/__fixtures__/domain';

describe('Dashboard', () => {
  describe('PortfolioOverview component', () => {
    it('should render stat cards with labels', () => {
      render(<Dashboard />);
      expect(screen.getByText('Total Net Assets')).toBeInTheDocument();
      expect(screen.getByText("Today's Profit")).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
      expect(screen.getByText('Active Trades')).toBeInTheDocument();
    });

    it('should render stat values from domain', () => {
      render(<Dashboard />);
      expect(screen.getByText(DASHBOARD_STATS_DOMAIN.VALID.totalNetAssets)).toBeInTheDocument();
      expect(screen.getByText(DASHBOARD_STATS_DOMAIN.VALID.todayProfit)).toBeInTheDocument();
      expect(screen.getByText(DASHBOARD_STATS_DOMAIN.VALID.cumulativeReturn)).toBeInTheDocument();
      expect(screen.getByText(DASHBOARD_STATS_DOMAIN.VALID.activeTrades)).toBeInTheDocument();
    });
  });

  describe('PerformanceChart component', () => {
    it('should render chart title', () => {
      render(<Dashboard />);
      expect(screen.getByText('Portfolio Performance')).toBeInTheDocument();
    });
  });

  describe('AssetAllocation component', () => {
    it('should render allocation title', () => {
      render(<Dashboard />);
      expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    });
  });

  describe('MarketTrends component', () => {
    it('should render trends title', () => {
      render(<Dashboard />);
      expect(screen.getByText('Market Trends')).toBeInTheDocument();
    });
  });

  describe('WatchList component', () => {
    it('should render watch list title', () => {
      render(<Dashboard />);
      expect(screen.getByText('Watch List')).toBeInTheDocument();
    });
  });

  describe('QuickActions component', () => {
    it('should render quick actions title', () => {
      render(<Dashboard />);
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });
  });

  describe('RecentTransactions component', () => {
    it('should render recent transactions title', () => {
      render(<Dashboard />);
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });
  });

  describe('RiskAnalysis component', () => {
    it('should render risk analysis title', () => {
      render(<Dashboard />);
      expect(screen.getByText('Risk Analysis')).toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('should render multiple dashboard sections', () => {
      render(<Dashboard />);
      const sections = [
        'Portfolio Performance',
        'Asset Allocation',
        'Market Trends',
        'Watch List',
        'Quick Actions',
        'Recent Transactions',
        'Risk Analysis',
      ];
      sections.forEach((section) => {
        expect(screen.getByText(section)).toBeInTheDocument();
      });
    });
  });
});
