import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Clients } from './Clients';

describe('Clients', () => {
  it('should render the Clients title', () => {
    render(<Clients />);
    expect(screen.getByText('Clients')).toBeInTheDocument();
  });

  it('should render the description', () => {
    render(<Clients />);
    expect(screen.getByText('Manage your client portfolio and relationships')).toBeInTheDocument();
  });

  it('should render the Card component', () => {
    render(<Clients />);
    const card = screen.getByText('Clients').closest('.glass');
    expect(card).toBeInTheDocument();
  });

  it('should render AG Grid component', () => {
    render(<Clients />);
    const agGrid = document.querySelector('.ag-theme-quartz-dark');
    expect(agGrid).toBeInTheDocument();
  });
});
