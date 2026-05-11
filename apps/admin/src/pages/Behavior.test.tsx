import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Behavior } from './Behavior';

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
});
