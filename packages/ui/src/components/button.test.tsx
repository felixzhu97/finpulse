import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Button } from './button';
import * as ButtonModule from './button';

const { buttonVariants } = ButtonModule;

// =============================================================================
// Domain Test Values - UI Components
// =============================================================================

const UI_DOMAIN = {
  BUTTON: {
    TEXT: {
      CLICK_ME: 'Click me',
      DEFAULT: 'Default',
      DELETE: 'Delete',
      OUTLINE: 'Outline',
      SECONDARY: 'Secondary',
      GHOST: 'Ghost',
      LINK: 'Link',
      ICON: 'Icon',
      ICON_SM: 'Icon SM',
      ICON_LG: 'Icon LG',
      CUSTOM: 'Custom',
      WITH_ID: 'With ID',
      CLOSE_DIALOG: 'Close dialog',
    },

    VARIANTS: {
      DEFAULT: 'default',
      DESTRUCTIVE: 'destructive',
      OUTLINE: 'outline',
      SECONDARY: 'secondary',
      GHOST: 'ghost',
      LINK: 'link',
    },

    SIZES: {
      DEFAULT: 'default',
      SM: 'sm',
      LG: 'lg',
      ICON: 'icon',
      ICON_SM: 'icon-sm',
      ICON_LG: 'icon-lg',
    },

    CLASSES: {
      DEFAULT: {
        inlineFlex: 'inline-flex',
        bgPrimary: 'bg-primary',
        bgDestructive: 'bg-destructive',
        bgSecondary: 'bg-secondary',
        hoverAccent: 'hover:bg-accent',
        border: 'border',
        bgBackground: 'bg-background',
        textPrimary: 'text-primary',
        underlineOffset: 'underline-offset-4',
      },
      SIZES: {
        h9: 'h-9',
        h8: 'h-8',
        h10: 'h-10',
        size9: 'size-9',
        size8: 'size-8',
        size10: 'size-10',
        px4: 'px-4',
      },
      DISABLED: {
        opacity: 'disabled:opacity-50',
      },
    },
  },
} as const;

// =============================================================================
// Test Factories
// =============================================================================

const renderButton = (ui: React.ReactElement) => render(ui);

// =============================================================================
// Test Suite
// =============================================================================

describe('Button', () => {
  describe('when rendered with default props', () => {
    it('should render with correct text', () => {
      renderButton(<Button>{UI_DOMAIN.BUTTON.TEXT.CLICK_ME}</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should render as a button element', () => {
      renderButton(<Button>{UI_DOMAIN.BUTTON.TEXT.DEFAULT}</Button>);
      expect(screen.getByRole('button')).toHaveProperty('tagName', 'BUTTON');
    });

    it('should have data-slot attribute', () => {
      renderButton(<Button>{UI_DOMAIN.BUTTON.TEXT.DEFAULT}</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button');
    });

    it('should have default variant classes', () => {
      renderButton(<Button>{UI_DOMAIN.BUTTON.TEXT.DEFAULT}</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(UI_DOMAIN.BUTTON.CLASSES.DEFAULT.inlineFlex);
      expect(button).toHaveClass(UI_DOMAIN.BUTTON.CLASSES.DEFAULT.bgPrimary);
    });
  });

  describe('when variant prop is specified', () => {
    it.each([
      { variant: UI_DOMAIN.BUTTON.VARIANTS.DEFAULT, expectedClass: UI_DOMAIN.BUTTON.CLASSES.DEFAULT.bgPrimary },
      { variant: UI_DOMAIN.BUTTON.VARIANTS.DESTRUCTIVE, expectedClass: UI_DOMAIN.BUTTON.CLASSES.DEFAULT.bgDestructive },
      { variant: UI_DOMAIN.BUTTON.VARIANTS.SECONDARY, expectedClass: UI_DOMAIN.BUTTON.CLASSES.DEFAULT.bgSecondary },
      { variant: UI_DOMAIN.BUTTON.VARIANTS.GHOST, expectedClass: UI_DOMAIN.BUTTON.CLASSES.DEFAULT.hoverAccent },
    ])(
      'should apply $variant variant classes',
      ({ variant, expectedClass }) => {
        renderButton(
          <Button variant={variant as any}>{UI_DOMAIN.BUTTON.TEXT.DEFAULT}</Button>
        );
        expect(screen.getByRole('button')).toHaveClass(expectedClass);
      }
    );

    it('should apply outline variant classes', () => {
      renderButton(
        <Button variant={UI_DOMAIN.BUTTON.VARIANTS.OUTLINE}>
          {UI_DOMAIN.BUTTON.TEXT.OUTLINE}
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass(UI_DOMAIN.BUTTON.CLASSES.DEFAULT.border);
      expect(button).toHaveClass(UI_DOMAIN.BUTTON.CLASSES.DEFAULT.bgBackground);
    });

    it('should apply link variant classes', () => {
      renderButton(
        <Button variant={UI_DOMAIN.BUTTON.VARIANTS.LINK}>
          {UI_DOMAIN.BUTTON.TEXT.LINK}
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass(UI_DOMAIN.BUTTON.CLASSES.DEFAULT.textPrimary);
      expect(button).toHaveClass(UI_DOMAIN.BUTTON.CLASSES.DEFAULT.underlineOffset);
    });
  });

  describe('when size prop is specified', () => {
    it.each([
      { size: UI_DOMAIN.BUTTON.SIZES.DEFAULT, expectedClasses: [UI_DOMAIN.BUTTON.CLASSES.SIZES.h9, UI_DOMAIN.BUTTON.CLASSES.SIZES.px4] },
      { size: UI_DOMAIN.BUTTON.SIZES.SM, expectedClasses: [UI_DOMAIN.BUTTON.CLASSES.SIZES.h8] },
      { size: UI_DOMAIN.BUTTON.SIZES.LG, expectedClasses: [UI_DOMAIN.BUTTON.CLASSES.SIZES.h10] },
      { size: UI_DOMAIN.BUTTON.SIZES.ICON, expectedClasses: [UI_DOMAIN.BUTTON.CLASSES.SIZES.size9] },
      { size: UI_DOMAIN.BUTTON.SIZES.ICON_SM, expectedClasses: [UI_DOMAIN.BUTTON.CLASSES.SIZES.size8] },
      { size: UI_DOMAIN.BUTTON.SIZES.ICON_LG, expectedClasses: [UI_DOMAIN.BUTTON.CLASSES.SIZES.size10] },
    ])(
      'should apply $size size classes',
      ({ size, expectedClasses }) => {
        renderButton(
          <Button size={size as any}>{UI_DOMAIN.BUTTON.TEXT.DEFAULT}</Button>
        );
        expectedClasses.forEach((cls) => {
          expect(screen.getByRole('button')).toHaveClass(cls);
        });
      }
    );
  });

  describe('when disabled', () => {
    it('should render disabled button', () => {
      renderButton(<Button disabled>{UI_DOMAIN.BUTTON.TEXT.DEFAULT}</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should have disabled opacity class', () => {
      renderButton(<Button disabled>{UI_DOMAIN.BUTTON.TEXT.DEFAULT}</Button>);
      expect(screen.getByRole('button')).toHaveClass(
        UI_DOMAIN.BUTTON.CLASSES.DISABLED.opacity
      );
    });
  });

  describe('when onClick handler is provided', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderButton(<Button onClick={handleClick}>{UI_DOMAIN.BUTTON.TEXT.CLICK_ME}</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderButton(
        <Button disabled onClick={handleClick}>
          {UI_DOMAIN.BUTTON.TEXT.DEFAULT}
        </Button>
      );
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('when type prop is specified', () => {
    it('should apply submit type', () => {
      renderButton(<Button type="submit">{UI_DOMAIN.BUTTON.TEXT.DEFAULT}</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('when additional props are provided', () => {
    it('should apply custom className', () => {
      renderButton(
        <Button className="custom-class">{UI_DOMAIN.BUTTON.TEXT.CUSTOM}</Button>
      );
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should pass through id attribute', () => {
      renderButton(<Button id="btn-1">{UI_DOMAIN.BUTTON.TEXT.WITH_ID}</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('id', 'btn-1');
    });

    it('should apply aria-label for accessibility', () => {
      renderButton(
        <Button aria-label={UI_DOMAIN.BUTTON.TEXT.CLOSE_DIALOG}>X</Button>
      );
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        UI_DOMAIN.BUTTON.TEXT.CLOSE_DIALOG
      );
    });
  });

  describe('when asChild prop is true', () => {
    it('should render child element as link', () => {
      renderButton(
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

  it.each([
    { variant: 'default', expectedClass: UI_DOMAIN.BUTTON.CLASSES.DEFAULT.bgPrimary },
    { variant: 'destructive', expectedClass: UI_DOMAIN.BUTTON.CLASSES.DEFAULT.bgDestructive },
    { variant: 'outline', expectedClass: UI_DOMAIN.BUTTON.CLASSES.DEFAULT.border },
    { variant: 'secondary', expectedClass: UI_DOMAIN.BUTTON.CLASSES.DEFAULT.bgSecondary },
    { variant: 'ghost', expectedClass: UI_DOMAIN.BUTTON.CLASSES.DEFAULT.hoverAccent },
    { variant: 'link', expectedClass: UI_DOMAIN.BUTTON.CLASSES.DEFAULT.textPrimary },
  ])(
    'should return correct classes for $variant variant',
    ({ variant, expectedClass }) => {
      const classes = buttonVariants({ variant: variant as any });
      expect(classes).toContain(expectedClass);
    }
  );

  it.each([
    { size: 'default', expectedClass: UI_DOMAIN.BUTTON.CLASSES.SIZES.h9 },
    { size: 'sm', expectedClass: UI_DOMAIN.BUTTON.CLASSES.SIZES.h8 },
    { size: 'lg', expectedClass: UI_DOMAIN.BUTTON.CLASSES.SIZES.h10 },
    { size: 'icon', expectedClass: UI_DOMAIN.BUTTON.CLASSES.SIZES.size9 },
  ])(
    'should return correct classes for $size size',
    ({ size, expectedClass }) => {
      const classes = buttonVariants({ size: size as any });
      expect(classes).toContain(expectedClass);
    }
  );

  it('should handle custom className', () => {
    const classes = buttonVariants({ className: 'custom-btn' });
    expect(classes).toContain('custom-btn');
  });
});
