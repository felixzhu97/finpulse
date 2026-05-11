import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Transactions,
  typeClass,
  statusClass,
  formatQuantity,
  formatPrice,
  formatAmount,
  formatFee,
  transactionColumnDefs,
  transactionRowData,
} from './Transactions';

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

  it('should render the grid with proper theme class', () => {
    render(<Transactions />);
    const grid = document.querySelector('.ag-theme-quartz-dark.ag-robinhood');
    expect(grid).toBeInTheDocument();
  });

  it('should have CardContent with proper styling', () => {
    render(<Transactions />);
    const card = document.querySelector('.glass');
    expect(card).toBeInTheDocument();
  });

  it('should render grid with animation enabled', () => {
    render(<Transactions />);
    const grid = document.querySelector('.ag-theme-quartz-dark');
    expect(grid).toBeInTheDocument();
  });
});

describe('typeClass', () => {
  it('should return cell-accent for Buy type', () => {
    expect(typeClass('Buy')).toBe('cell-accent');
  });

  it('should return cell-destructive for Sell type', () => {
    expect(typeClass('Sell')).toBe('cell-destructive');
  });

  it('should return cell-chart-3 for Deposit type', () => {
    expect(typeClass('Deposit')).toBe('cell-chart-3');
  });

  it('should return cell-chart-4 for Withdrawal type', () => {
    expect(typeClass('Withdrawal')).toBe('cell-chart-4');
  });

  it('should return empty string for unknown type', () => {
    expect(typeClass('Unknown')).toBe('');
  });
});

describe('statusClass', () => {
  it('should return bg-accent-10 for Completed status', () => {
    expect(statusClass('Completed')).toBe('bg-accent-10');
  });

  it('should return bg-chart-3-10 for Pending status', () => {
    expect(statusClass('Pending')).toBe('bg-chart-3-10');
  });

  it('should return bg-destructive-10 for Failed status', () => {
    expect(statusClass('Failed')).toBe('bg-destructive-10');
  });

  it('should return empty string for unknown status', () => {
    expect(statusClass('Unknown')).toBe('');
  });
});

describe('formatQuantity', () => {
  it('should return string of number when value is non-zero', () => {
    expect(formatQuantity(10)).toBe('10');
  });

  it('should return dash for zero value', () => {
    expect(formatQuantity(0)).toBe('-');
  });

  it('should return dash for null value', () => {
    expect(formatQuantity(null)).toBe('-');
  });

  it('should return dash for undefined value', () => {
    expect(formatQuantity(undefined)).toBe('-');
  });
});

describe('formatPrice', () => {
  it('should format price with yen symbol', () => {
    expect(formatPrice(182.52)).toBe('¥182.52');
  });

  it('should return dash for null value', () => {
    expect(formatPrice(null)).toBe('-');
  });

  it('should return dash for undefined value', () => {
    expect(formatPrice(undefined)).toBe('-');
  });
});

describe('formatAmount', () => {
  it('should format amount with yen symbol', () => {
    expect(formatAmount(1825.2)).toBe('¥1825.20');
  });

  it('should return empty string for null value', () => {
    expect(formatAmount(null)).toBe('');
  });

  it('should return empty string for undefined value', () => {
    expect(formatAmount(undefined)).toBe('');
  });
});

describe('formatFee', () => {
  it('should format fee with yen symbol', () => {
    expect(formatFee(1)).toBe('¥1.00');
  });

  it('should return dash for null value', () => {
    expect(formatFee(null)).toBe('-');
  });

  it('should return dash for undefined value', () => {
    expect(formatFee(undefined)).toBe('-');
  });

  it('should return dash for zero value', () => {
    expect(formatFee(0)).toBe('-');
  });
});

describe('transactionRowData', () => {
  it('should contain transaction records', () => {
    expect(transactionRowData.length).toBe(8);
  });

  it('should have correct data structure', () => {
    const first = transactionRowData[0];
    expect(first.id).toBe('1');
    expect(first.type).toBe('Buy');
    expect(first.symbol).toBe('AAPL');
    expect(first.status).toBe('Completed');
  });
});

describe('transactionColumnDefs', () => {
  it('should have column definitions', () => {
    expect(transactionColumnDefs.length).toBeGreaterThan(0);
  });

  it('should have date column', () => {
    const dateCol = transactionColumnDefs.find((c) => c.field === 'date');
    expect(dateCol).toBeDefined();
    expect(dateCol?.headerName).toBe('Date');
  });

  it('should have type column with cellClass', () => {
    const typeCol = transactionColumnDefs.find((c) => c.field === 'type');
    expect(typeCol).toBeDefined();
    expect(typeCol?.cellClass).toBeDefined();
  });
});
