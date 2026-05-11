import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('should render the PortfolioOverview component', () => {
    render(<Dashboard />);
    expect(screen.getByText('Total Net Assets')).toBeInTheDocument();
    expect(screen.getByText("Today's Profit")).toBeInTheDocument();
    expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
    expect(screen.getByText('Active Trades')).toBeInTheDocument();
  });

  it('should render the PerformanceChart component', () => {
    render(<Dashboard />);
    expect(screen.getByText('Portfolio Performance')).toBeInTheDocument();
  });

  it('should render the AssetAllocation component', () => {
    render(<Dashboard />);
    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
  });

  it('should render the MarketTrends component', () => {
    render(<Dashboard />);
    expect(screen.getByText('Market Trends')).toBeInTheDocument();
  });

  it('should render the WatchList component', () => {
    render(<Dashboard />);
    expect(screen.getByText('Watch List')).toBeInTheDocument();
  });

  it('should render the QuickActions component', () => {
    render(<Dashboard />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('should render the RecentTransactions component', () => {
    render(<Dashboard />);
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
  });

  it('should render the RiskAnalysis component', () => {
    render(<Dashboard />);
    expect(screen.getByText('Risk Analysis')).toBeInTheDocument();
  });

  it('should render all stat values', () => {
    render(<Dashboard />);
    expect(screen.getByText('¥12,847,382')).toBeInTheDocument();
    expect(screen.getByText('¥128,473')).toBeInTheDocument();
    expect(screen.getByText('34.82%')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
  });
});
