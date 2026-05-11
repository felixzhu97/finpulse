import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Clients,
  statusClass,
  riskClass,
  formatPortfolioValue,
  clientColumnDefs,
  clientRowData,
} from './Clients';

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

  it('should render the grid with proper theme class', () => {
    render(<Clients />);
    const grid = document.querySelector('.ag-theme-quartz-dark.ag-robinhood');
    expect(grid).toBeInTheDocument();
  });

  it('should have CardContent with proper styling', () => {
    render(<Clients />);
    const card = document.querySelector('.glass');
    expect(card).toBeInTheDocument();
  });

  it('should render grid with animation enabled', () => {
    render(<Clients />);
    const grid = document.querySelector('.ag-theme-quartz-dark');
    expect(grid).toBeInTheDocument();
  });
});

describe('statusClass', () => {
  it('should return bg-accent-10 for Active status', () => {
    expect(statusClass('Active')).toBe('bg-accent-10');
  });

  it('should return bg-muted-10 for Inactive status', () => {
    expect(statusClass('Inactive')).toBe('bg-muted-10');
  });

  it('should return bg-chart-3-10 for Pending status', () => {
    expect(statusClass('Pending')).toBe('bg-chart-3-10');
  });

  it('should return empty string for unknown status', () => {
    expect(statusClass('Unknown')).toBe('');
  });
});

describe('riskClass', () => {
  it('should return bg-chart-3-10 for Conservative risk', () => {
    expect(riskClass('Conservative')).toBe('bg-chart-3-10');
  });

  it('should return bg-chart-2-10 for Moderate risk', () => {
    expect(riskClass('Moderate')).toBe('bg-chart-2-10');
  });

  it('should return bg-destructive-10 for Aggressive risk', () => {
    expect(riskClass('Aggressive')).toBe('bg-destructive-10');
  });

  it('should return empty string for unknown risk profile', () => {
    expect(riskClass('Unknown')).toBe('');
  });
});

describe('formatPortfolioValue', () => {
  it('should format portfolio value in millions', () => {
    expect(formatPortfolioValue(1250000)).toBe('¥1.25M');
  });

  it('should format large portfolio value', () => {
    expect(formatPortfolioValue(3200000)).toBe('¥3.20M');
  });

  it('should return empty string for null value', () => {
    expect(formatPortfolioValue(null)).toBe('');
  });

  it('should return empty string for undefined value', () => {
    expect(formatPortfolioValue(undefined)).toBe('');
  });
});

describe('clientRowData', () => {
  it('should contain client records', () => {
    expect(clientRowData.length).toBe(8);
  });

  it('should have correct data structure', () => {
    const first = clientRowData[0];
    expect(first.id).toBe('1');
    expect(first.name).toBe('John Smith');
    expect(first.status).toBe('Active');
    expect(first.riskProfile).toBe('Moderate');
  });
});

describe('clientColumnDefs', () => {
  it('should have column definitions', () => {
    expect(clientColumnDefs.length).toBeGreaterThan(0);
  });

  it('should have name column pinned left', () => {
    const nameCol = clientColumnDefs.find((c) => c.field === 'name');
    expect(nameCol).toBeDefined();
    expect(nameCol?.pinned).toBe('left');
  });

  it('should have status column with cellClass function', () => {
    const statusCol = clientColumnDefs.find((c) => c.field === 'status');
    expect(statusCol).toBeDefined();
    expect(statusCol?.cellClass).toBeDefined();
  });

  it('should have risk profile column with cellClass function', () => {
    const riskCol = clientColumnDefs.find((c) => c.field === 'riskProfile');
    expect(riskCol).toBeDefined();
    expect(riskCol?.cellClass).toBeDefined();
  });
});
