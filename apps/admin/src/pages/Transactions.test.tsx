import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Transactions } from './Transactions';

describe('Transactions', () => {
  it('should render the Transactions title', () => {
    render(<Transactions />);
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('should render the description', () => {
    render(<Transactions />);
    expect(screen.getByText('View and manage all your transaction history')).toBeInTheDocument();
  });

  it('should render the Card component', () => {
    render(<Transactions />);
    const card = screen.getByText('Transactions').closest('.glass');
    expect(card).toBeInTheDocument();
  });

  it('should render AG Grid component', () => {
    render(<Transactions />);
    const agGrid = document.querySelector('.ag-theme-quartz-dark');
    expect(agGrid).toBeInTheDocument();
  });
});
