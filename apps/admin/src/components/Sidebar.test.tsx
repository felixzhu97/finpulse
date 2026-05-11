import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('should render the FinPulse logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('FinPulse')).toBeInTheDocument();
  });

  it('should render navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
  });

  it('should render the toggle button', () => {
    render(<Sidebar />);
    const toggleButton = document.querySelector('button[aria-label="Collapse"]');
    expect(toggleButton).toBeInTheDocument();
  });

  it('should render bottom menu items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('should toggle sidebar when clicking toggle button', () => {
    render(<Sidebar />);
    const toggleButton = document.querySelector('button[aria-label="Collapse"]');
    expect(toggleButton).toBeInTheDocument();
    fireEvent.click(toggleButton!);
    const expandButton = document.querySelector('button[aria-label="Expand"]');
    expect(expandButton).toBeInTheDocument();
  });

  it('should render the sidebar as an aside element', () => {
    render(<Sidebar />);
    const aside = document.querySelector('aside');
    expect(aside).toBeInTheDocument();
  });
});
