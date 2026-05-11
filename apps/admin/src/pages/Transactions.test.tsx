/**
 * Transactions Page Tests
 * Following TDD best practices with parameterized tests and domain test values
 */
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
import {
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  createTransaction,
} from '@/__fixtures__/domain';

describe('Transactions', () => {
  describe('page rendering', () => {
    it('should render the Transactions title', () => {
      render(<Transactions />);
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });

    it('should render the description', () => {
      render(<Transactions />);
      expect(screen.getByText('View and manage all your transaction history')).toBeInTheDocument();
    });

    it('should render Card component with glass styling', () => {
      render(<Transactions />);
      const card = screen.getByText('Transactions').closest('.glass');
      expect(card).toBeInTheDocument();
    });

    it('should render AG Grid component', () => {
      render(<Transactions />);
      const agGrid = document.querySelector('.ag-theme-quartz-dark');
      expect(agGrid).toBeInTheDocument();
    });

    it('should render AG Grid with robinhood theme', () => {
      render(<Transactions />);
      const grid = document.querySelector('.ag-theme-quartz-dark.ag-robinhood');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('typeClass', () => {
    it.each(TRANSACTION_TYPES)('should return correct class for "$type" type', (type) => {
      const expectedClasses: Record<string, string> = {
        Buy: 'cell-accent',
        Sell: 'cell-destructive',
        Deposit: 'cell-chart-3',
        Withdrawal: 'cell-chart-4',
      };
      expect(typeClass(type)).toBe(expectedClasses[type]);
    });

    it('should return empty string for unknown type', () => {
      expect(typeClass('Unknown')).toBe('');
      expect(typeClass('')).toBe('');
    });
  });

  describe('statusClass', () => {
    it.each(TRANSACTION_STATUSES)('should return correct class for "$status" status', (status) => {
      const expectedClasses: Record<string, string> = {
        Completed: 'bg-accent-10',
        Pending: 'bg-chart-3-10',
        Failed: 'bg-destructive-10',
      };
      expect(statusClass(status)).toBe(expectedClasses[status]);
    });

    it('should return empty string for unknown status', () => {
      expect(statusClass('Unknown')).toBe('');
      expect(statusClass('')).toBe('');
    });
  });

  describe('formatQuantity', () => {
    it('should return string representation for non-zero values', () => {
      expect(formatQuantity(10)).toBe('10');
      expect(formatQuantity(100)).toBe('100');
      expect(formatQuantity(1)).toBe('1');
    });

    it('should return dash for zero value', () => {
      expect(formatQuantity(0)).toBe('-');
    });

    it.each([null, undefined])('should return dash for %s value', (value) => {
      expect(formatQuantity(value)).toBe('-');
    });
  });

  describe('formatPrice', () => {
    it('should format price with yen symbol', () => {
      expect(formatPrice(182.52)).toBe('¥182.52');
      expect(formatPrice(100)).toBe('¥100.00');
    });

    it.each([null, undefined])('should return dash for %s value', (value) => {
      expect(formatPrice(value)).toBe('-');
    });
  });

  describe('formatAmount', () => {
    it('should format amount with yen symbol', () => {
      expect(formatAmount(1825.2)).toBe('¥1825.20');
      expect(formatAmount(1000)).toBe('¥1000.00');
    });

    it.each([null, undefined])('should return empty string for %s value', (value) => {
      expect(formatAmount(value)).toBe('');
    });
  });

  describe('formatFee', () => {
    it('should format fee with yen symbol', () => {
      expect(formatFee(1)).toBe('¥1.00');
      expect(formatFee(0.5)).toBe('¥0.50');
    });

    it.each([null, undefined, 0])('should return dash for %s value', (value) => {
      expect(formatFee(value)).toBe('-');
    });
  });

  describe('transactionRowData', () => {
    it('should contain transaction records', () => {
      expect(transactionRowData.length).toBeGreaterThan(0);
    });

    it('should have correct data structure for first record', () => {
      const first = transactionRowData[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('symbol');
      expect(first).toHaveProperty('status');
    });

    it('should have valid transaction types', () => {
      transactionRowData.forEach((tx) => {
        expect(TRANSACTION_TYPES).toContain(tx.type);
      });
    });

    it('should have valid transaction statuses', () => {
      transactionRowData.forEach((tx) => {
        expect(TRANSACTION_STATUSES).toContain(tx.status);
      });
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
      expect(typeof typeCol?.cellClass).toBe('function');
    });

    it('should have all required fields', () => {
      const requiredFields = ['date', 'type', 'symbol', 'name', 'quantity', 'price', 'amount', 'fee', 'status'];
      requiredFields.forEach((field) => {
        expect(transactionColumnDefs.find((c) => c.field === field)).toBeDefined();
      });
    });
  });

  describe('boundary value tests', () => {
    it('should handle transaction with zero quantity', () => {
      const tx = createTransaction({ quantity: 0 });
      expect(formatQuantity(tx.quantity)).toBe('-');
    });

    it('should handle transaction with large amount', () => {
      const tx = createTransaction({ amount: 999999.99 });
      expect(formatAmount(tx.amount)).toBe('¥999999.99');
    });

    it('should handle null price gracefully', () => {
      const tx = createTransaction({ price: null as unknown as number });
      expect(formatPrice(tx.price)).toBe('-');
    });
  });
});
