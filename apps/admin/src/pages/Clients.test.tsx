/**
 * Clients Page Tests
 * Following TDD best practices with parameterized tests and domain test values
 */
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
import {
  CLIENT_STATUSES,
  RISK_PROFILES,
} from '@/__fixtures__/domain';

describe('Clients', () => {
  describe('page rendering', () => {
    it('should render the Clients title', () => {
      render(<Clients />);
      expect(screen.getByText('Clients')).toBeInTheDocument();
    });

    it('should render the description', () => {
      render(<Clients />);
      expect(screen.getByText('Manage your client portfolio and relationships')).toBeInTheDocument();
    });

    it('should render Card component with glass styling', () => {
      render(<Clients />);
      const card = screen.getByText('Clients').closest('.glass');
      expect(card).toBeInTheDocument();
    });

    it('should render AG Grid component', () => {
      render(<Clients />);
      const agGrid = document.querySelector('.ag-theme-quartz-dark');
      expect(agGrid).toBeInTheDocument();
    });

    it('should render AG Grid with robinhood theme', () => {
      render(<Clients />);
      const grid = document.querySelector('.ag-theme-quartz-dark.ag-robinhood');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('statusClass', () => {
    it.each(CLIENT_STATUSES)('should return correct class for "$status" status', (status) => {
      const expectedClasses: Record<string, string> = {
        Active: 'bg-accent-10',
        Inactive: 'bg-muted-10',
        Pending: 'bg-chart-3-10',
      };
      expect(statusClass(status)).toBe(expectedClasses[status]);
    });

    it('should return empty string for unknown status', () => {
      expect(statusClass('Unknown')).toBe('');
      expect(statusClass('')).toBe('');
    });
  });

  describe('riskClass', () => {
    it.each(RISK_PROFILES)('should return correct class for "$risk" risk profile', (risk) => {
      const expectedClasses: Record<string, string> = {
        Conservative: 'bg-chart-3-10',
        Moderate: 'bg-chart-2-10',
        Aggressive: 'bg-destructive-10',
      };
      expect(riskClass(risk)).toBe(expectedClasses[risk]);
    });

    it('should return empty string for unknown risk profile', () => {
      expect(riskClass('Unknown')).toBe('');
      expect(riskClass('')).toBe('');
    });
  });

  describe('formatPortfolioValue', () => {
    it.each([
      { value: 1250000, expected: '¥1.25M' },
      { value: 3200000, expected: '¥3.20M' },
      { value: 1000000, expected: '¥1.00M' },
    ])('should format $value to "$expected"', ({ value, expected }) => {
      expect(formatPortfolioValue(value)).toBe(expected);
    });

    it.each([null, undefined])('should return empty string for %s value', (value) => {
      expect(formatPortfolioValue(value)).toBe('');
    });
  });

  describe('clientRowData', () => {
    it('should contain client records', () => {
      expect(clientRowData.length).toBeGreaterThan(0);
    });

    it('should have correct data structure for first record', () => {
      const first = clientRowData[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('riskProfile');
    });

    it('should have valid client statuses', () => {
      clientRowData.forEach((client) => {
        expect(CLIENT_STATUSES).toContain(client.status);
      });
    });

    it('should have valid risk profiles', () => {
      clientRowData.forEach((client) => {
        expect(RISK_PROFILES).toContain(client.riskProfile);
      });
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
      expect(typeof statusCol?.cellClass).toBe('function');
    });

    it('should have risk profile column with cellClass function', () => {
      const riskCol = clientColumnDefs.find((c) => c.field === 'riskProfile');
      expect(riskCol).toBeDefined();
      expect(typeof riskCol?.cellClass).toBe('function');
    });

    it('should have all required fields', () => {
      const requiredFields = ['name', 'email', 'phone', 'portfolioValue', 'totalAssets', 'activeInvestments', 'joinDate', 'status', 'riskProfile'];
      requiredFields.forEach((field) => {
        expect(clientColumnDefs.find((c) => c.field === field)).toBeDefined();
      });
    });
  });
});
