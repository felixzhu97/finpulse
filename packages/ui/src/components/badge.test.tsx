import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as BadgeModule from './badge';
import { Badge } from './badge';

const { badgeVariants } = BadgeModule;

// =============================================================================
// Domain Test Values - Badge Component
// =============================================================================

const BADGE_DOMAIN = {
  TEXT: {
    TEST: 'Test Badge',
    DEFAULT: 'Default Badge',
    SLOT: 'Slot Badge',
    SECONDARY: 'Secondary',
    DESTRUCTIVE: 'Destructive',
    OUTLINE: 'Outline',
    CUSTOM: 'Custom',
    WITH_ID: 'With ID',
    HOVER: 'Hover Me',
    LINK: 'Link Badge',
  },

  VARIANTS: {
    DEFAULT: 'default',
    SECONDARY: 'secondary',
    DESTRUCTIVE: 'destructive',
    OUTLINE: 'outline',
  },

  CLASSES: {
    inlineFlex: 'inline-flex',
    bgPrimary: 'bg-primary',
    bgSecondary: 'bg-secondary',
    bgDestructive: 'bg-destructive',
    textForeground: 'text-foreground',
  },
} as const;

// =============================================================================
// Test Suite
// =============================================================================

describe('Badge', () => {
  describe('when rendered with default props', () => {
    it('should render with correct text content', () => {
      render(<Badge>{BADGE_DOMAIN.TEXT.TEST}</Badge>);
      expect(screen.getByText(BADGE_DOMAIN.TEXT.TEST)).toBeInTheDocument();
    });

    it('should render as a span element', () => {
      render(<Badge>{BADGE_DOMAIN.TEXT.DEFAULT}</Badge>);
      expect(screen.getByText(BADGE_DOMAIN.TEXT.DEFAULT).tagName).toBe('SPAN');
    });

    it('should have data-slot attribute', () => {
      render(<Badge>{BADGE_DOMAIN.TEXT.SLOT}</Badge>);
      expect(screen.getByText(BADGE_DOMAIN.TEXT.SLOT)).toHaveAttribute('data-slot', 'badge');
    });

    it('should have default variant class', () => {
      render(<Badge>{BADGE_DOMAIN.TEXT.DEFAULT}</Badge>);
      expect(screen.getByText(BADGE_DOMAIN.TEXT.DEFAULT)).toHaveClass(BADGE_DOMAIN.CLASSES.inlineFlex);
    });
  });

  describe('when variant is specified', () => {
    it.each([
      { variant: BADGE_DOMAIN.VARIANTS.DEFAULT, expectedClass: BADGE_DOMAIN.CLASSES.bgPrimary },
      { variant: BADGE_DOMAIN.VARIANTS.SECONDARY, expectedClass: BADGE_DOMAIN.CLASSES.bgSecondary },
      { variant: BADGE_DOMAIN.VARIANTS.DESTRUCTIVE, expectedClass: BADGE_DOMAIN.CLASSES.bgDestructive },
      { variant: BADGE_DOMAIN.VARIANTS.OUTLINE, expectedClass: BADGE_DOMAIN.CLASSES.textForeground },
    ])(
      'should apply $variant variant class',
      ({ variant, expectedClass }) => {
        render(
          <Badge variant={variant as any}>{BADGE_DOMAIN.TEXT.TEST}</Badge>
        );
        expect(screen.getByText(BADGE_DOMAIN.TEXT.TEST)).toHaveClass(expectedClass);
      }
    );
  });

  describe('when additional props are provided', () => {
    it('should apply custom className', () => {
      render(<Badge className="custom-class">{BADGE_DOMAIN.TEXT.CUSTOM}</Badge>);
      expect(screen.getByText(BADGE_DOMAIN.TEXT.CUSTOM)).toHaveClass('custom-class');
    });

    it('should pass through standard HTML attributes', () => {
      render(<Badge id="test-id">{BADGE_DOMAIN.TEXT.WITH_ID}</Badge>);
      expect(screen.getByText(BADGE_DOMAIN.TEXT.WITH_ID)).toHaveAttribute('id', 'test-id');
    });

    it('should apply title attribute for accessibility', () => {
      render(<Badge title="Tooltip text">{BADGE_DOMAIN.TEXT.HOVER}</Badge>);
      expect(screen.getByText(BADGE_DOMAIN.TEXT.HOVER)).toHaveAttribute('title', 'Tooltip text');
    });
  });

  describe('when asChild prop is true', () => {
    it('should render child element', () => {
      render(
        <Badge asChild>
          <a href="/test">{BADGE_DOMAIN.TEXT.LINK}</a>
        </Badge>
      );
      const link = screen.getByRole('link', { name: BADGE_DOMAIN.TEXT.LINK });
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

  it.each([
    { variant: 'default', expectedClass: BADGE_DOMAIN.CLASSES.bgPrimary },
    { variant: 'secondary', expectedClass: BADGE_DOMAIN.CLASSES.bgSecondary },
    { variant: 'destructive', expectedClass: BADGE_DOMAIN.CLASSES.bgDestructive },
    { variant: 'outline', expectedClass: BADGE_DOMAIN.CLASSES.textForeground },
  ])(
    'should return correct classes for $variant variant',
    ({ variant, expectedClass }) => {
      const classes = badgeVariants({ variant: variant as any });
      expect(classes).toContain(expectedClass);
    }
  );

  it('should handle custom className', () => {
    const classes = badgeVariants({ className: 'custom-class' });
    expect(classes).toContain('custom-class');
  });
});
