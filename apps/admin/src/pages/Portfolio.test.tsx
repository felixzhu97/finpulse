import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Portfolio } from './Portfolio';

describe('Portfolio', () => {
  it('should render the Portfolio title', () => {
    render(<Portfolio />);
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });

  it('should render the description', () => {
    render(<Portfolio />);
    expect(screen.getByText('View your complete investment portfolio')).toBeInTheDocument();
  });

  it('should render the Card component', () => {
    render(<Portfolio />);
    const card = screen.getByText('Portfolio').closest('.glass');
    expect(card).toBeInTheDocument();
  });

  it('should render AG Grid component', () => {
    render(<Portfolio />);
    const agGrid = document.querySelector('.ag-theme-quartz-dark');
    expect(agGrid).toBeInTheDocument();
  });
});
