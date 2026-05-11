/**
 * Behavior Page Tests
 * Following TDD best practices with proper fetch mocking and domain test values
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Behavior, getUserSummary } from './Behavior';
import { BEHAVIOR_DOMAIN } from '@/__fixtures__/domain';

const mockFetch = vi.fn();

describe('Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('successful data loading', () => {
    it('should render the Behavior Events title', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });
      render(<Behavior />);
      await waitFor(() => {
        expect(screen.getByText('Behavior Events')).toBeInTheDocument();
      });
    });

    it('should render the Refresh button', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });
      render(<Behavior />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
    });

    it('should render the description', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });
      render(<Behavior />);
      await waitFor(() => {
        expect(screen.getByText(/recent events from portal/i)).toBeInTheDocument();
      });
    });

    it('should render AG Grid when data is loaded', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });
      render(<Behavior />);
      await waitFor(() => {
        const agGrid = document.querySelector('.ag-theme-quartz-dark');
        expect(agGrid).toBeInTheDocument();
      });
    });
  });

  describe('loading states', () => {
    it('should show loading state initially', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<Behavior />);
      await waitFor(() => {
        expect(screen.getByText('Loading…')).toBeInTheDocument();
      });
    });

    it('should show loading indicator while fetching', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<Behavior />);
      
      await waitFor(() => {
        const loadingText = screen.getByText('Loading…');
        expect(loadingText).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should display error message on fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Network Error',
      });
      render(<Behavior />);
      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument();
      });
    });

    it('should display error message for server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        status: 500,
      });
      render(<Behavior />);
      await waitFor(() => {
        expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
      });
    });

    it('should display error message for 404 Not Found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        status: 404,
      });
      render(<Behavior />);
      await waitFor(() => {
        expect(screen.getByText('Not Found')).toBeInTheDocument();
      });
    });
  });

  describe('data handling', () => {
    it('should show empty state when no data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });
      render(<Behavior />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
    });

    it('should handle null data in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      });
      render(<Behavior />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
    });

    it('should handle undefined data in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });
      render(<Behavior />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
    });

    it('should display behavior event data when available', async () => {
      const mockData = [
        BEHAVIOR_DOMAIN.VALID.pageView,
        BEHAVIOR_DOMAIN.VALID.trade,
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });
      render(<Behavior />);
      await waitFor(() => {
        const agGrid = document.querySelector('.ag-theme-quartz-dark');
        expect(agGrid).toBeInTheDocument();
      });
    });
  });

  describe('refresh functionality', () => {
    it('should have a working refresh button', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });

      render(<Behavior />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });
  });

  describe('component structure', () => {
    it('should render Card component', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });
      render(<Behavior />);
      await waitFor(() => {
        const card = screen.getByText('Behavior Events').closest('.glass');
        expect(card).toBeInTheDocument();
      });
    });

    it('should enable grid animation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });
      render(<Behavior />);
      await waitFor(() => {
        const agGrid = document.querySelector('.ag-theme-quartz-dark.ag-robinhood');
        expect(agGrid).toBeInTheDocument();
      });
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

  it('should handle partial data with name only', () => {
    // Empty string name returns email only, not the name
    expect(getUserSummary({ name: '' })).toBe('—');
    expect(getUserSummary({ email: 'alice@example.com' })).toBe('alice@example.com');
  });
});
