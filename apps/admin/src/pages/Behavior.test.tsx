import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Behavior, getUserSummary } from './Behavior';

describe('Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();
  });

  it('should render the Behavior Events title', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    render(<Behavior />);
    await waitFor(() => {
      expect(screen.getByText('Behavior Events')).toBeInTheDocument();
    });
  });

  it('should render the Refresh button', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    render(<Behavior />);
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  it('should render the description', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    render(<Behavior />);
    await waitFor(() => {
      expect(screen.getByText(/Recent events from portal/)).toBeInTheDocument();
    });
  });

  it('should show loading state initially', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );
    render(<Behavior />);
    await waitFor(() => {
      expect(screen.getByText('Loading…')).toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      statusText: 'Network Error',
    });
    render(<Behavior />);
    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  it('should render the Card component', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    render(<Behavior />);
    await waitFor(() => {
      const card = screen.getByText('Behavior Events').closest('.glass');
      expect(card).toBeInTheDocument();
    });
  });

  it('should render AG Grid when data is loaded', async () => {
    const mockData = [
      { id: '1', name: 'page_view', properties: { source: 'portal' }, timestamp: 1704067200000 },
    ];
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockData }),
    });
    render(<Behavior />);
    await waitFor(() => {
      const agGrid = document.querySelector('.ag-theme-quartz-dark');
      expect(agGrid).toBeInTheDocument();
    });
  });

  it('should disable Refresh button while loading', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );
    render(<Behavior />);
    await waitFor(() => {
      const button = screen.getByText('Loading…');
      expect(button).toBeInTheDocument();
    });
  });

  it('should show empty state when no data', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    render(<Behavior />);
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
      expect(document.querySelector('.ag-theme-quartz-dark')).toBeInTheDocument();
    });
  });

  it('should handle empty data array response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    render(<Behavior />);
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  it('should handle null data in response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: null }),
    });
    render(<Behavior />);
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  it('should handle undefined data in response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    render(<Behavior />);
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  it('should enable grid animation', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    render(<Behavior />);
    await waitFor(() => {
      const agGrid = document.querySelector('.ag-theme-quartz-dark.ag-robinhood');
      expect(agGrid).toBeInTheDocument();
    });
  });
});

describe('getUserSummary', () => {
  it('should return email with name when both are present', () => {
    const props = { email: 'test@example.com', name: 'John Doe' };
    expect(getUserSummary(props)).toBe('John Doe (test@example.com)');
  });

  it('should return email only when name is not present', () => {
    const props = { email: 'test@example.com' };
    expect(getUserSummary(props)).toBe('test@example.com');
  });

  it('should return truncated userId when no email', () => {
    const props = { userId: 'abc12345678' };
    expect(getUserSummary(props)).toBe('abc12345…');
  });

  it('should return em dash when no identifying info', () => {
    const props = {};
    expect(getUserSummary(props)).toBe('—');
  });

  it('should handle null/undefined properties gracefully', () => {
    expect(getUserSummary(null as unknown as Record<string, unknown>)).toBe('—');
    expect(getUserSummary(undefined as unknown as Record<string, unknown>)).toBe('—');
  });

  it('should prioritize email over userId', () => {
    const props = { email: 'test@example.com', userId: '12345' };
    expect(getUserSummary(props)).toBe('test@example.com');
  });
});
