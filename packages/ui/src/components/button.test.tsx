import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Button } from './button';
import * as ButtonModule from './button';

const { buttonVariants } = ButtonModule;

describe('Button', () => {
  describe('when rendered with default props', () => {
    it('should render with correct text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should render as a button element', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveProperty('tagName', 'BUTTON');
    });

    it('should have data-slot attribute', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button');
    });

    it('should have default variant classes', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('bg-primary');
    });
  });

  describe('when variant prop is specified', () => {
    it('should apply default variant when no variant provided', () => {
      render(<Button>Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-primary');
    });

    it('should apply destructive variant classes', () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-destructive');
    });

    it('should apply outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('bg-background');
    });

    it('should apply secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-secondary');
    });

    it('should apply ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');
    });

    it('should apply link variant classes', () => {
      render(<Button variant="link">Link</Button>);
      expect(screen.getByRole('button')).toHaveClass('text-primary');
      expect(screen.getByRole('button')).toHaveClass('underline-offset-4');
    });
  });

  describe('when size prop is specified', () => {
    it('should apply default size classes', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
      expect(button).toHaveClass('px-4');
    });

    it('should apply sm size classes', () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-8');
    });

    it('should apply lg size classes', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-10');
    });

    it('should apply icon size classes', () => {
      render(<Button size="icon">Icon</Button>);
      expect(screen.getByRole('button')).toHaveClass('size-9');
    });

    it('should apply icon-sm size classes', () => {
      render(<Button size="icon-sm">Icon SM</Button>);
      expect(screen.getByRole('button')).toHaveClass('size-8');
    });

    it('should apply icon-lg size classes', () => {
      render(<Button size="icon-lg">Icon LG</Button>);
      expect(screen.getByRole('button')).toHaveClass('size-10');
    });
  });

  describe('when disabled', () => {
    it('should render disabled button', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should have disabled opacity class', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toHaveClass('disabled:opacity-50');
    });
  });

  describe('when onClick handler is provided', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('when type prop is specified', () => {
    it('should apply submit type', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('when additional props are provided', () => {
    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should pass through id attribute', () => {
      render(<Button id="btn-1">With ID</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('id', 'btn-1');
    });

    it('should apply aria-label for accessibility', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close dialog');
    });
  });

  describe('when asChild prop is true', () => {
    it('should render child element', () => {
      render(
        <Button asChild>
          <a href="/page">Link Button</a>
        </Button>
      );
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/page');
    });
  });
});

describe('buttonVariants', () => {
  it('should export buttonVariants function', () => {
    expect(buttonVariants).toBeDefined();
    expect(typeof buttonVariants).toBe('function');
  });

  it('should return correct classes for default variant', () => {
    const classes = buttonVariants({ variant: 'default' });
    expect(classes).toContain('bg-primary');
  });

  it('should return correct classes for destructive variant', () => {
    const classes = buttonVariants({ variant: 'destructive' });
    expect(classes).toContain('bg-destructive');
  });

  it('should return correct classes for outline variant', () => {
    const classes = buttonVariants({ variant: 'outline' });
    expect(classes).toContain('border');
  });

  it('should return correct classes for secondary variant', () => {
    const classes = buttonVariants({ variant: 'secondary' });
    expect(classes).toContain('bg-secondary');
  });

  it('should return correct classes for ghost variant', () => {
    const classes = buttonVariants({ variant: 'ghost' });
    expect(classes).toContain('hover:bg-accent');
  });

  it('should return correct classes for link variant', () => {
    const classes = buttonVariants({ variant: 'link' });
    expect(classes).toContain('text-primary');
    expect(classes).toContain('underline-offset-4');
  });

  it('should return correct classes for default size', () => {
    const classes = buttonVariants({ size: 'default' });
    expect(classes).toContain('h-9');
  });

  it('should return correct classes for sm size', () => {
    const classes = buttonVariants({ size: 'sm' });
    expect(classes).toContain('h-8');
  });

  it('should return correct classes for lg size', () => {
    const classes = buttonVariants({ size: 'lg' });
    expect(classes).toContain('h-10');
  });

  it('should return correct classes for icon size', () => {
    const classes = buttonVariants({ size: 'icon' });
    expect(classes).toContain('size-9');
  });

  it('should handle custom className', () => {
    const classes = buttonVariants({ className: 'custom-btn' });
    expect(classes).toContain('custom-btn');
  });
});
