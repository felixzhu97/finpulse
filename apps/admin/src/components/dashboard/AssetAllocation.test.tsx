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

  it('should render all asset categories', () => {
    render(<AssetAllocation />);
    expect(screen.getByText('Stocks')).toBeInTheDocument();
    expect(screen.getByText('Bonds')).toBeInTheDocument();
    expect(screen.getByText('Funds')).toBeInTheDocument();
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('should render percentage values', () => {
    render(<AssetAllocation />);
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('should render Total Assets label', () => {
    render(<AssetAllocation />);
    expect(screen.getByText('Total Assets')).toBeInTheDocument();
  });

  it('should render Card component', () => {
    render(<AssetAllocation />);
    const card = screen.getByText('Asset Allocation').closest('.glass');
    expect(card).toBeInTheDocument();
  });
});
