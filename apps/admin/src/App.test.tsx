import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('should render the Sidebar with FinPulse logo', () => {
    render(<App />);
    expect(screen.getByText('FinPulse')).toBeInTheDocument();
  });

  it('should render navigation items', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });

  it('should render the search input', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('Search stocks, funds, assets...')).toBeInTheDocument();
  });
});
