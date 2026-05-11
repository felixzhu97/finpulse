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

  it('should render all risk metric names', () => {
    render(<RiskAnalysis />);
    expect(screen.getByText('Volatility')).toBeInTheDocument();
    expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
    expect(screen.getByText('Max Drawdown')).toBeInTheDocument();
    expect(screen.getByText('VaR (95%)')).toBeInTheDocument();
  });

  it('should render Overall Risk Score section', () => {
    render(<RiskAnalysis />);
    expect(screen.getByText('Overall Risk Score')).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('should render Card component', () => {
    render(<RiskAnalysis />);
    const card = screen.getByText('Risk Analysis').closest('.glass');
    expect(card).toBeInTheDocument();
  });
});
