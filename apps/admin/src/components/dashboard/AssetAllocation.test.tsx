import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssetAllocation } from './AssetAllocation';

describe('AssetAllocation', () => {
  it('should render the AssetAllocation title', () => {
    render(<AssetAllocation />);
    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
  });

  it('should render total assets value', () => {
    render(<AssetAllocation />);
    expect(screen.getByText('¥12.8M')).toBeInTheDocument();
  });

  it('should render asset categories', () => {
    render(<AssetAllocation />);
    expect(screen.getByText('Stocks')).toBeInTheDocument();
    expect(screen.getByText('Bonds')).toBeInTheDocument();
  });
});
