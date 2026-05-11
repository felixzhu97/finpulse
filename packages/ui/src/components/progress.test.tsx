import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Progress } from './progress';

// =============================================================================
// Domain Test Values - Progress Component
// =============================================================================

const PROGRESS_DOMAIN = {
  TEST_ID: 'progress',

  INDICATOR_SLOT: 'progress-indicator',

  VALUE: {
    ZERO: 0,
    MIN: 1,
    MID: 50,
    HIGH: 75,
    MAX: 100,
  },

  INDICATOR_STYLE: {
    EXPECTED_PATTERNS: {
      ZERO: '100%',
      MID: '50%',
      HIGH: '25%',
      MAX: '0%',
    },
  },

  CLASSES: {
    roundedFull: 'rounded-full',
    h2: 'h-2',
    indicator: {
      bgPrimary: 'bg-primary',
      hFull: 'h-full',
      flex1: 'flex-1',
      transitionAll: 'transition-all',
    },
  },

  UNDEFINED_CASES: {
    UNDEFINED: undefined,
    NULL: null as unknown as undefined,
  },
} as const;

// =============================================================================
// Test Suite
// =============================================================================

describe('Progress', () => {
  describe('when rendered with default props', () => {
    it('should render without crashing', () => {
      render(<Progress data-testid={PROGRESS_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(PROGRESS_DOMAIN.TEST_ID)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Progress data-testid={PROGRESS_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(PROGRESS_DOMAIN.TEST_ID)).toHaveAttribute(
        'data-slot',
        PROGRESS_DOMAIN.TEST_ID
      );
    });

    it('should have default progress indicator', () => {
      const { container } = render(<Progress data-testid={PROGRESS_DOMAIN.TEST_ID} />);
      const indicator = container.querySelector(
        `[data-slot="${PROGRESS_DOMAIN.INDICATOR_SLOT}"]`
      );
      expect(indicator).toBeInTheDocument();
    });

    it('should have rounded-full and h-2 classes', () => {
      render(<Progress data-testid={PROGRESS_DOMAIN.TEST_ID} />);
      const progress = screen.getByTestId(PROGRESS_DOMAIN.TEST_ID);
      expect(progress).toHaveClass(PROGRESS_DOMAIN.CLASSES.roundedFull);
      expect(progress).toHaveClass(PROGRESS_DOMAIN.CLASSES.h2);
    });
  });

  describe('when value prop is provided', () => {
    it.each([
      { value: PROGRESS_DOMAIN.VALUE.ZERO, expectedPattern: PROGRESS_DOMAIN.INDICATOR_STYLE.EXPECTED_PATTERNS.ZERO },
      { value: PROGRESS_DOMAIN.VALUE.MID, expectedPattern: PROGRESS_DOMAIN.INDICATOR_STYLE.EXPECTED_PATTERNS.MID },
      { value: PROGRESS_DOMAIN.VALUE.HIGH, expectedPattern: PROGRESS_DOMAIN.INDICATOR_STYLE.EXPECTED_PATTERNS.HIGH },
      { value: PROGRESS_DOMAIN.VALUE.MAX, expectedPattern: PROGRESS_DOMAIN.INDICATOR_STYLE.EXPECTED_PATTERNS.MAX },
    ])(
      'should render with value $value and indicator at $expectedPattern',
      ({ value, expectedPattern }) => {
        render(<Progress value={value} data-testid={PROGRESS_DOMAIN.TEST_ID} />);
        const indicator = screen
          .getByTestId(PROGRESS_DOMAIN.TEST_ID)
          .querySelector(`[data-slot="${PROGRESS_DOMAIN.INDICATOR_SLOT}"]`);
        expect(indicator).toHaveAttribute('style', expect.stringContaining(expectedPattern));
      }
    );
  });

  describe('when value is undefined', () => {
    it.each([
      { value: PROGRESS_DOMAIN.UNDEFINED_CASES.UNDEFINED },
      { value: PROGRESS_DOMAIN.UNDEFINED_CASES.NULL },
    ])(
      'should render indicator at 100% when value is $value',
      ({ value }) => {
        render(<Progress value={value} data-testid={PROGRESS_DOMAIN.TEST_ID} />);
        const indicator = screen
          .getByTestId(PROGRESS_DOMAIN.TEST_ID)
          .querySelector(`[data-slot="${PROGRESS_DOMAIN.INDICATOR_SLOT}"]`);
        expect(indicator).toHaveAttribute(
          'style',
          expect.stringContaining(PROGRESS_DOMAIN.INDICATOR_STYLE.EXPECTED_PATTERNS.ZERO)
        );
      }
    );
  });

  describe('when custom className is provided', () => {
    it('should apply custom className and merge with defaults', () => {
      render(<Progress className="custom-progress" data-testid={PROGRESS_DOMAIN.TEST_ID} />);
      const progress = screen.getByTestId(PROGRESS_DOMAIN.TEST_ID);
      expect(progress).toHaveClass('custom-progress');
      expect(progress).toHaveClass(PROGRESS_DOMAIN.CLASSES.roundedFull);
    });
  });

  describe('when additional props are passed', () => {
    it('should pass through id attribute', () => {
      render(<Progress id="progress-1" data-testid={PROGRESS_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(PROGRESS_DOMAIN.TEST_ID)).toHaveAttribute('id', 'progress-1');
    });
  });

  describe('indicator behavior', () => {
    it('indicator should have bg-primary, h-full, flex-1, and transition-all classes', () => {
      const { container } = render(<Progress data-testid={PROGRESS_DOMAIN.TEST_ID} />);
      const indicator = container.querySelector(
        `[data-slot="${PROGRESS_DOMAIN.INDICATOR_SLOT}"]`
      );
      expect(indicator).toHaveClass(PROGRESS_DOMAIN.CLASSES.indicator.bgPrimary);
      expect(indicator).toHaveClass(PROGRESS_DOMAIN.CLASSES.indicator.hFull);
      expect(indicator).toHaveClass(PROGRESS_DOMAIN.CLASSES.indicator.flex1);
      expect(indicator).toHaveClass(PROGRESS_DOMAIN.CLASSES.indicator.transitionAll);
    });
  });
});
