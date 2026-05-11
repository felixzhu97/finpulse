import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PortfolioOverview } from './PortfolioOverview';

describe('PortfolioOverview', () => {
  it('should render stat cards', () => {
    render(<PortfolioOverview />);
    expect(screen.getByText('Total Net Assets')).toBeInTheDocument();
    expect(screen.getByText("Today's Profit")).toBeInTheDocument();
  });

  it('should render stat values', () => {
    render(<PortfolioOverview />);
    expect(screen.getByText('¥12,847,382')).toBeInTheDocument();
  });
});
