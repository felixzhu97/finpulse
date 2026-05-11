import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as BadgeModule from './badge';
import { Badge } from './badge';

const { badgeVariants } = BadgeModule;

describe('Badge', () => {
  describe('when rendered with default props', () => {
    it('should render with correct text content', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should render as a span element', () => {
      render(<Badge>Default Badge</Badge>);
      expect(screen.getByText('Default Badge').tagName).toBe('SPAN');
    });

    it('should have data-slot attribute', () => {
      render(<Badge>Slot Badge</Badge>);
      expect(screen.getByText('Slot Badge')).toHaveAttribute('data-slot', 'badge');
    });
  });

  describe('when variant is specified', () => {
    it('should apply default variant class when no variant prop is provided', () => {
      render(<Badge>Default Variant</Badge>);
      expect(screen.getByText('Default Variant')).toHaveClass('inline-flex');
    });

    it('should apply secondary variant class when variant="secondary"', () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      expect(screen.getByText('Secondary')).toHaveClass('bg-secondary');
    });

    it('should apply destructive variant class when variant="destructive"', () => {
      render(<Badge variant="destructive">Destructive</Badge>);
      expect(screen.getByText('Destructive')).toHaveClass('bg-destructive');
    });

    it('should apply outline variant class when variant="outline"', () => {
      render(<Badge variant="outline">Outline</Badge>);
      expect(screen.getByText('Outline')).toHaveClass('text-foreground');
    });
  });

  describe('when additional props are provided', () => {
    it('should apply custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      expect(screen.getByText('Custom')).toHaveClass('custom-class');
    });

    it('should pass through standard HTML attributes', () => {
      render(<Badge id="test-id">With ID</Badge>);
      expect(screen.getByText('With ID')).toHaveAttribute('id', 'test-id');
    });

    it('should apply title attribute for accessibility', () => {
      render(<Badge title="Tooltip text">Hover Me</Badge>);
      expect(screen.getByText('Hover Me')).toHaveAttribute('title', 'Tooltip text');
    });
  });

  describe('when asChild prop is true', () => {
    it('should render child element', () => {
      render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      );
      const link = screen.getByRole('link', { name: 'Link Badge' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });
});

describe('badgeVariants', () => {
  it('should export badgeVariants function', () => {
    expect(badgeVariants).toBeDefined();
    expect(typeof badgeVariants).toBe('function');
  });

  it('should return correct classes for default variant', () => {
    const classes = badgeVariants({ variant: 'default' });
    expect(classes).toContain('bg-primary');
  });

  it('should return correct classes for secondary variant', () => {
    const classes = badgeVariants({ variant: 'secondary' });
    expect(classes).toContain('bg-secondary');
  });

  it('should return correct classes for destructive variant', () => {
    const classes = badgeVariants({ variant: 'destructive' });
    expect(classes).toContain('bg-destructive');
  });

  it('should return correct classes for outline variant', () => {
    const classes = badgeVariants({ variant: 'outline' });
    expect(classes).toContain('text-foreground');
  });

  it('should handle custom className', () => {
    const classes = badgeVariants({ className: 'custom-class' });
    expect(classes).toContain('custom-class');
  });
});
