/**
 * Reports Page Tests
 * Following TDD best practices with parameterized tests and domain test values
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Reports,
  reportTypeClass,
  reportStatusClass,
  reportColumnDefs,
  reportRowData,
} from './Reports';
import {
  REPORT_TYPES,
  REPORT_STATUSES,
} from '@/__fixtures__/domain';

describe('Reports', () => {
  describe('page rendering', () => {
    it('should render the Reports title', () => {
      render(<Reports />);
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('should render the description', () => {
      render(<Reports />);
      expect(screen.getByText('Generate and download financial reports')).toBeInTheDocument();
    });

    it('should render Card component with glass styling', () => {
      render(<Reports />);
      const card = screen.getByText('Reports').closest('.glass');
      expect(card).toBeInTheDocument();
    });

    it('should render AG Grid component', () => {
      render(<Reports />);
      const agGrid = document.querySelector('.ag-theme-quartz-dark');
      expect(agGrid).toBeInTheDocument();
    });

    it('should render AG Grid with robinhood theme', () => {
      render(<Reports />);
      const grid = document.querySelector('.ag-theme-quartz-dark.ag-robinhood');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('reportTypeClass', () => {
    it.each(REPORT_TYPES)('should return correct class for "$type" type', (type) => {
      const expectedClasses: Record<string, string> = {
        Performance: 'bg-primary-10',
        Risk: 'bg-destructive-10',
        Tax: 'bg-chart-3-10',
        Compliance: 'bg-accent-10',
        Custom: 'bg-muted-10',
      };
      expect(reportTypeClass(type)).toBe(expectedClasses[type]);
    });

    it('should return empty string for unknown type', () => {
      expect(reportTypeClass('Unknown')).toBe('');
      expect(reportTypeClass('')).toBe('');
    });
  });

  describe('reportStatusClass', () => {
    it.each(REPORT_STATUSES)('should return correct class for "$status" status', (status) => {
      const expectedClasses: Record<string, string> = {
        Ready: 'bg-accent-10',
        Generating: 'bg-chart-3-10',
        Failed: 'bg-destructive-10',
      };
      expect(reportStatusClass(status)).toBe(expectedClasses[status]);
    });

    it('should return empty string for unknown status', () => {
      expect(reportStatusClass('Unknown')).toBe('');
      expect(reportStatusClass('')).toBe('');
    });
  });

  describe('reportRowData', () => {
    it('should contain report records', () => {
      expect(reportRowData.length).toBeGreaterThan(0);
    });

    it('should have correct data structure for first record', () => {
      const first = reportRowData[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('title');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('status');
    });

    it('should have valid report types', () => {
      reportRowData.forEach((report) => {
        expect(REPORT_TYPES).toContain(report.type);
      });
    });

    it('should have valid report statuses', () => {
      reportRowData.forEach((report) => {
        expect(REPORT_STATUSES).toContain(report.status);
      });
    });
  });

  describe('reportColumnDefs', () => {
    it('should have column definitions', () => {
      expect(reportColumnDefs.length).toBeGreaterThan(0);
    });

    it('should have title column pinned left', () => {
      const titleCol = reportColumnDefs.find((c) => c.field === 'title');
      expect(titleCol).toBeDefined();
      expect(titleCol?.pinned).toBe('left');
    });

    it('should have type column with cellClass function', () => {
      const typeCol = reportColumnDefs.find((c) => c.field === 'type');
      expect(typeCol).toBeDefined();
      expect(typeof typeCol?.cellClass).toBe('function');
    });

    it('should have status column with cellClass function', () => {
      const statusCol = reportColumnDefs.find((c) => c.field === 'status');
      expect(statusCol).toBeDefined();
      expect(typeof statusCol?.cellClass).toBe('function');
    });

    it('should have all required fields', () => {
      const requiredFields = ['title', 'type', 'period', 'generatedDate', 'format', 'fileSize', 'status'];
      requiredFields.forEach((field) => {
        expect(reportColumnDefs.find((c) => c.field === field)).toBeDefined();
      });
    });
  });
});
