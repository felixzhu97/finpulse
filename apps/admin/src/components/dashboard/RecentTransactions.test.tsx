import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentTransactions } from './RecentTransactions';

describe('RecentTransactions', () => {
  it('should render the RecentTransactions title', () => {
    render(<RecentTransactions />);
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
  });

  it('should render View All button', () => {
    render(<RecentTransactions />);
    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  it('should render transaction symbols', () => {
    render(<RecentTransactions />);
    expect(screen.getByText('NVDA')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });
});
