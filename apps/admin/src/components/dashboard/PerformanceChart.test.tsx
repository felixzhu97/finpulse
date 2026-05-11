import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PerformanceChart } from './PerformanceChart';

describe('PerformanceChart', () => {
  it('should render the PerformanceChart title', () => {
    render(<PerformanceChart />);
    expect(screen.getByText('Portfolio Performance')).toBeInTheDocument();
  });

  it('should render time range buttons', () => {
    render(<PerformanceChart />);
    expect(screen.getByText('1Y')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
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

  it('should switch active range when clicking a button', async () => {
    render(<PerformanceChart />);
    const oneMonthButton = screen.getByText('1M');
    fireEvent.click(oneMonthButton);
    expect(screen.getByText('1M')).toBeInTheDocument();
  });

  it('should render all time range options', () => {
    render(<PerformanceChart />);
    const ranges = ['1W', '1M', '3M', '6M', '1Y', 'All'];
    ranges.forEach((range) => {
      expect(screen.getByText(range)).toBeInTheDocument();
    });
  });
});
