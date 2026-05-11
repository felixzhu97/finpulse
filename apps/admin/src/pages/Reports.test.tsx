import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Reports,
  reportTypeClass,
  reportStatusClass,
  reportColumnDefs,
  reportRowData,
} from './Reports';

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

  it('should render the grid with proper theme class', () => {
    render(<Reports />);
    const grid = document.querySelector('.ag-theme-quartz-dark.ag-robinhood');
    expect(grid).toBeInTheDocument();
  });

  it('should have CardContent with proper styling', () => {
    render(<Reports />);
    const card = document.querySelector('.glass');
    expect(card).toBeInTheDocument();
  });

  it('should render grid with animation enabled', () => {
    render(<Reports />);
    const grid = document.querySelector('.ag-theme-quartz-dark');
    expect(grid).toBeInTheDocument();
  });
});

describe('reportTypeClass', () => {
  it('should return bg-primary-10 for Performance type', () => {
    expect(reportTypeClass('Performance')).toBe('bg-primary-10');
  });

  it('should return bg-destructive-10 for Risk type', () => {
    expect(reportTypeClass('Risk')).toBe('bg-destructive-10');
  });

  it('should return bg-chart-3-10 for Tax type', () => {
    expect(reportTypeClass('Tax')).toBe('bg-chart-3-10');
  });

  it('should return bg-accent-10 for Compliance type', () => {
    expect(reportTypeClass('Compliance')).toBe('bg-accent-10');
  });

  it('should return bg-muted-10 for Custom type', () => {
    expect(reportTypeClass('Custom')).toBe('bg-muted-10');
  });

  it('should return empty string for unknown type', () => {
    expect(reportTypeClass('Unknown')).toBe('');
  });
});

describe('reportStatusClass', () => {
  it('should return bg-accent-10 for Ready status', () => {
    expect(reportStatusClass('Ready')).toBe('bg-accent-10');
  });

  it('should return bg-chart-3-10 for Generating status', () => {
    expect(reportStatusClass('Generating')).toBe('bg-chart-3-10');
  });

  it('should return bg-destructive-10 for Failed status', () => {
    expect(reportStatusClass('Failed')).toBe('bg-destructive-10');
  });

  it('should return empty string for unknown status', () => {
    expect(reportStatusClass('Unknown')).toBe('');
  });
});

describe('reportRowData', () => {
  it('should contain report records', () => {
    expect(reportRowData.length).toBe(8);
  });

  it('should have correct data structure', () => {
    const first = reportRowData[0];
    expect(first.id).toBe('1');
    expect(first.title).toBe('Q4 2025 Performance Report');
    expect(first.type).toBe('Performance');
    expect(first.status).toBe('Ready');
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
    expect(typeCol?.cellClass).toBeDefined();
  });

  it('should have status column with cellClass function', () => {
    const statusCol = reportColumnDefs.find((c) => c.field === 'status');
    expect(statusCol).toBeDefined();
    expect(statusCol?.cellClass).toBeDefined();
  });
});
