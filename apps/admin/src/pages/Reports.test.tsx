import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Reports } from './Reports';

describe('Reports', () => {
  it('should render the Reports title', () => {
    render(<Reports />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('should render the description', () => {
    render(<Reports />);
    expect(screen.getByText('Generate and download financial reports')).toBeInTheDocument();
  });

  it('should render the Card component', () => {
    render(<Reports />);
    const card = screen.getByText('Reports').closest('.glass');
    expect(card).toBeInTheDocument();
  });

  it('should render AG Grid component', () => {
    render(<Reports />);
    const agGrid = document.querySelector('.ag-theme-quartz-dark');
    expect(agGrid).toBeInTheDocument();
  });
});
