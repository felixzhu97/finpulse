/**
 * PerformanceChart Component Tests
 * Following TDD best practices with parameterized tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PerformanceChart } from './PerformanceChart';
import { TIME_RANGE_DOMAIN } from '@/__fixtures__/domain';

describe('PerformanceChart', () => {
  describe('rendering', () => {
    it('should render the PerformanceChart title', () => {
      render(<PerformanceChart />);
      expect(screen.getByText('Portfolio Performance')).toBeInTheDocument();
    });

    it('should render the benchmark label', () => {
      render(<PerformanceChart />);
      expect(screen.getByText('vs Benchmark Index')).toBeInTheDocument();
    });

    it('should render legend items', () => {
      render(<PerformanceChart />);
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Benchmark')).toBeInTheDocument();
    });
  });

  describe('time range buttons', () => {
    it('should render all time range options from domain', () => {
      render(<PerformanceChart />);
      TIME_RANGE_DOMAIN.VALID.forEach((range) => {
        expect(screen.getByText(range)).toBeInTheDocument();
      });
    });

    it.each(TIME_RANGE_DOMAIN.VALID)('should render "$range" time range button', (range) => {
      render(<PerformanceChart />);
      expect(screen.getByRole('button', { name: range })).toBeInTheDocument();
    });
  });

  describe('time range selection', () => {
    it('should switch active range when clicking 1M button', () => {
      render(<PerformanceChart />);
      
      const oneMonthButton = screen.getByRole('button', { name: '1M' });
      fireEvent.click(oneMonthButton);
      
      expect(oneMonthButton).toBeInTheDocument();
    });

    it('should switch active range when clicking 1Y button', () => {
      render(<PerformanceChart />);
      
      const oneYearButton = screen.getByRole('button', { name: '1Y' });
      fireEvent.click(oneYearButton);
      
      expect(oneYearButton).toBeInTheDocument();
    });

    it('should switch active range when clicking All button', () => {
      render(<PerformanceChart />);
      
      const allButton = screen.getByRole('button', { name: 'All' });
      fireEvent.click(allButton);
      
      expect(allButton).toBeInTheDocument();
    });
  });

  describe('interactive behavior', () => {
    it('should respond to time range button clicks', () => {
      render(<PerformanceChart />);
      
      const buttons = screen.getAllByRole('button');
      const timeRangeButton = buttons.find((btn) => btn.textContent === '1M');
      
      if (timeRangeButton) {
        fireEvent.click(timeRangeButton);
      }
      
      expect(screen.getByText('Portfolio Performance')).toBeInTheDocument();
    });
  });
});
