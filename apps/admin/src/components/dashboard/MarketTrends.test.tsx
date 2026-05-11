import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketTrends } from './MarketTrends';

describe('MarketTrends', () => {
  it('should render the MarketTrends title', () => {
    render(<MarketTrends />);
    expect(screen.getByText('Market Trends')).toBeInTheDocument();
  });

  it('should render market names', () => {
    render(<MarketTrends />);
    expect(screen.getByText('Shanghai Composite')).toBeInTheDocument();
    expect(screen.getByText('Hang Seng Index')).toBeInTheDocument();
  });
});
