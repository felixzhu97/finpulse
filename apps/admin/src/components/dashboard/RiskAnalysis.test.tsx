import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskAnalysis } from './RiskAnalysis';

describe('RiskAnalysis', () => {
  it('should render the RiskAnalysis title', () => {
    render(<RiskAnalysis />);
    expect(screen.getByText('Risk Analysis')).toBeInTheDocument();
  });

  it('should render the Low Risk badge', () => {
    render(<RiskAnalysis />);
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });

  it('should render risk metrics', () => {
    render(<RiskAnalysis />);
    expect(screen.getByText('Volatility')).toBeInTheDocument();
    expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
  });
});
