import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WatchList } from './WatchList';

describe('WatchList', () => {
  it('should render the WatchList title', () => {
    render(<WatchList />);
    expect(screen.getByText('Watch List')).toBeInTheDocument();
  });

  it('should render the Add button', () => {
    render(<WatchList />);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('should render stock symbols', () => {
    render(<WatchList />);
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('TSLA')).toBeInTheDocument();
  });

  it('should render stock prices', () => {
    render(<WatchList />);
    expect(screen.getByText('$182.52')).toBeInTheDocument();
  });
});
