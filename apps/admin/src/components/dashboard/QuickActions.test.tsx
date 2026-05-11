import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickActions } from './QuickActions';

describe('QuickActions', () => {
  it('should render the QuickActions title', () => {
    render(<QuickActions />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<QuickActions />);
    expect(screen.getByText('Buy')).toBeInTheDocument();
    expect(screen.getByText('Sell')).toBeInTheDocument();
  });
});
