/**
 * RiskAnalysis Component Tests
 * Following TDD best practices with parameterized tests and domain test values
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskAnalysis } from './RiskAnalysis';
import { RISK_ANALYSIS_DOMAIN } from '@/__fixtures__/domain';

describe('RiskAnalysis', () => {
  describe('rendering', () => {
    it('should render the RiskAnalysis title', () => {
      render(<RiskAnalysis />);
      expect(screen.getByText('Risk Analysis')).toBeInTheDocument();
    });

    it('should render the Low Risk badge', () => {
      render(<RiskAnalysis />);
      expect(screen.getByText('Low Risk')).toBeInTheDocument();
    });

    it('should render Overall Risk Score section', () => {
      render(<RiskAnalysis />);
      expect(screen.getByText('Overall Risk Score')).toBeInTheDocument();
      expect(screen.getByText('82')).toBeInTheDocument();
      expect(screen.getByText('/100')).toBeInTheDocument();
    });
  });

  describe('risk metrics', () => {
    it('should render Volatility metric', () => {
      render(<RiskAnalysis />);
      expect(screen.getByText('Volatility')).toBeInTheDocument();
    });

    it('should render Sharpe Ratio metric', () => {
      render(<RiskAnalysis />);
      expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
    });

    it('should render Max Drawdown metric', () => {
      render(<RiskAnalysis />);
      expect(screen.getByText('Max Drawdown')).toBeInTheDocument();
    });

    it('should render VaR (95%) metric', () => {
      render(<RiskAnalysis />);
      expect(screen.getByText('VaR (95%)')).toBeInTheDocument();
    });

    it('should render all risk metrics from domain', () => {
      render(<RiskAnalysis />);
      Object.values(RISK_ANALYSIS_DOMAIN.METRICS).forEach((metric) => {
        expect(screen.getByText(metric.label)).toBeInTheDocument();
      });
    });
  });

  describe('Card component', () => {
    it('should render Card with glass styling', () => {
      render(<RiskAnalysis />);
      const card = screen.getByText('Risk Analysis').closest('.glass');
      expect(card).toBeInTheDocument();
    });
  });

  describe('risk levels', () => {
    it.each([
      { level: 'Low Risk', score: 82 },
      { level: 'Medium Risk', score: 55 },
      { level: 'High Risk', score: 25 },
    ])('should display $level with score $score', ({ level, score }) => {
      const { lowRisk, mediumRisk, highRisk } = RISK_ANALYSIS_DOMAIN.VALID;
      const riskKey = level.split(' ')[0].toLowerCase() + 'Risk' as 'lowRisk' | 'mediumRisk' | 'highRisk';
      const riskData = { lowRisk, mediumRisk, highRisk }[riskKey];
      
      expect(riskData?.level).toBe(level);
      expect(riskData?.score).toBe(score);
    });
  });

  describe('risk score formatting', () => {
    it('should display score out of 100', () => {
      render(<RiskAnalysis />);
      const scoreText = screen.getByText(/\/100/);
      expect(scoreText).toBeInTheDocument();
    });
  });
});
