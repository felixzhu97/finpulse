import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('should render the search input', () => {
    render(<Header />);
    expect(screen.getByPlaceholderText('Search stocks, funds, assets...')).toBeInTheDocument();
  });

  it('should render the Market Open badge', () => {
    render(<Header />);
    expect(screen.getByText('Market Open')).toBeInTheDocument();
  });

  it('should render the user name', () => {
    render(<Header />);
    expect(screen.getByText('John Chen')).toBeInTheDocument();
  });

  it('should render the user role', () => {
    render(<Header />);
    expect(screen.getByText('Senior Analyst')).toBeInTheDocument();
  });

  it('should render notification badge', () => {
    render(<Header />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render keyboard shortcut hint', () => {
    render(<Header />);
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('should allow typing in search input', () => {
    render(<Header />);
    const input = screen.getByPlaceholderText('Search stocks, funds, assets...');
    fireEvent.change(input, { target: { value: 'AAPL' } });
    expect(input).toHaveValue('AAPL');
  });

  it('should render icon buttons', () => {
    render(<Header />);
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
