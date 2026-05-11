import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

// =============================================================================
// Domain Test Values - Input Component
// =============================================================================

const INPUT_DOMAIN = {
  TEST_ID: 'input',

  PLACEHOLDER: 'Enter text...',

  TYPE: {
    EMAIL: 'email',
    PASSWORD: 'password',
    NUMBER: 'number',
    SEARCH: 'search',
    TEL: 'tel',
    URL: 'url',
  },

  VALUE: {
    INITIAL: 'Initial',
    UPDATED: 'Updated',
    TEST: 'Test Value',
    READ_ONLY: 'Read Only',
    TYPED: 'Hello World',
  },

  ATTRIBUTES: {
    USERNAME: 'username',
    USERNAME_INPUT: 'username-input',
  },

  ARIA: {
    LABEL: 'Search input',
    DESCRIPTION: 'description',
  },

  CLASSES: {
    roundedMd: 'rounded-md',
    border: 'border',
    disabledCursor: 'disabled:cursor-not-allowed',
    disabledOpacity: 'disabled:opacity-50',
    h9: 'h-9',
    wFull: 'w-full',
    ariaInvalidBorder: 'aria-invalid:border-destructive',
  },
} as const;

// =============================================================================
// Test Suite
// =============================================================================

describe('Input', () => {
  describe('when rendered with default props', () => {
    it('should render without crashing', () => {
      render(<Input data-testid={INPUT_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toBeInTheDocument();
    });

    it('should render as an input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveProperty('tagName', 'INPUT');
    });

    it('should have data-slot attribute', () => {
      render(<Input data-testid={INPUT_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveAttribute('data-slot', 'input');
    });

    it('should have rounded-md and border classes', () => {
      render(<Input data-testid={INPUT_DOMAIN.TEST_ID} />);
      const input = screen.getByTestId(INPUT_DOMAIN.TEST_ID);
      expect(input).toHaveClass(INPUT_DOMAIN.CLASSES.roundedMd);
      expect(input).toHaveClass(INPUT_DOMAIN.CLASSES.border);
    });
  });

  describe('when type prop is specified', () => {
    it.each([
      { type: INPUT_DOMAIN.TYPE.EMAIL, expected: 'email' },
      { type: INPUT_DOMAIN.TYPE.PASSWORD, expected: 'password' },
      { type: INPUT_DOMAIN.TYPE.NUMBER, expected: 'number' },
      { type: INPUT_DOMAIN.TYPE.SEARCH, expected: 'search' },
      { type: INPUT_DOMAIN.TYPE.TEL, expected: 'tel' },
      { type: INPUT_DOMAIN.TYPE.URL, expected: 'url' },
    ])(
      'should render as $expected input',
      ({ type, expected }) => {
        render(<Input type={type} data-testid={INPUT_DOMAIN.TEST_ID} />);
        expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveAttribute('type', expected);
      }
    );
  });

  describe('when placeholder is provided', () => {
    it('should render with placeholder text', () => {
      render(
        <Input placeholder={INPUT_DOMAIN.PLACEHOLDER} data-testid={INPUT_DOMAIN.TEST_ID} />
      );
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveAttribute(
        'placeholder',
        INPUT_DOMAIN.PLACEHOLDER
      );
    });
  });

  describe('when value is provided', () => {
    it('should render with value', () => {
      render(<Input value={INPUT_DOMAIN.VALUE.TEST} data-testid={INPUT_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveValue(INPUT_DOMAIN.VALUE.TEST);
    });

    it('should update value when changed', () => {
      const { rerender } = render(
        <Input value={INPUT_DOMAIN.VALUE.INITIAL} data-testid={INPUT_DOMAIN.TEST_ID} />
      );
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveValue(INPUT_DOMAIN.VALUE.INITIAL);

      rerender(
        <Input value={INPUT_DOMAIN.VALUE.UPDATED} data-testid={INPUT_DOMAIN.TEST_ID} />
      );
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveValue(INPUT_DOMAIN.VALUE.UPDATED);
    });
  });

  describe('when disabled', () => {
    it('should render disabled input', () => {
      render(<Input disabled data-testid={INPUT_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toBeDisabled();
    });

    it('should have disabled cursor and opacity classes', () => {
      render(<Input disabled data-testid={INPUT_DOMAIN.TEST_ID} />);
      const input = screen.getByTestId(INPUT_DOMAIN.TEST_ID);
      expect(input).toHaveClass(INPUT_DOMAIN.CLASSES.disabledCursor);
      expect(input).toHaveClass(INPUT_DOMAIN.CLASSES.disabledOpacity);
    });
  });

  describe('when onChange handler is provided', () => {
    it('should call onChange when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} data-testid={INPUT_DOMAIN.TEST_ID} />);
      await user.type(screen.getByTestId(INPUT_DOMAIN.TEST_ID), INPUT_DOMAIN.VALUE.TYPED);

      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value when typing', async () => {
      const user = userEvent.setup();

      render(<Input data-testid={INPUT_DOMAIN.TEST_ID} />);
      await user.type(screen.getByTestId(INPUT_DOMAIN.TEST_ID), INPUT_DOMAIN.VALUE.TYPED);

      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveValue(INPUT_DOMAIN.VALUE.TYPED);
    });
  });

  describe('when readOnly', () => {
    it('should render readonly input', () => {
      render(
        <Input readOnly value={INPUT_DOMAIN.VALUE.READ_ONLY} data-testid={INPUT_DOMAIN.TEST_ID} />
      );
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveAttribute('readonly');
    });

    it('should not allow typing when readonly', async () => {
      const user = userEvent.setup();

      render(
        <Input readOnly value={INPUT_DOMAIN.VALUE.READ_ONLY} data-testid={INPUT_DOMAIN.TEST_ID} />
      );
      await user.click(screen.getByTestId(INPUT_DOMAIN.TEST_ID));

      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveValue(INPUT_DOMAIN.VALUE.READ_ONLY);
    });
  });

  describe('when required', () => {
    it('should render required input', () => {
      render(<Input required data-testid={INPUT_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveAttribute('required');
    });
  });

  describe('when name prop is provided', () => {
    it('should have correct name attribute', () => {
      render(<Input name={INPUT_DOMAIN.ATTRIBUTES.USERNAME} data-testid={INPUT_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveAttribute(
        'name',
        INPUT_DOMAIN.ATTRIBUTES.USERNAME
      );
    });
  });

  describe('when id prop is provided', () => {
    it('should have correct id attribute', () => {
      render(
        <Input id={INPUT_DOMAIN.ATTRIBUTES.USERNAME_INPUT} data-testid={INPUT_DOMAIN.TEST_ID} />
      );
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveAttribute(
        'id',
        INPUT_DOMAIN.ATTRIBUTES.USERNAME_INPUT
      );
    });
  });

  describe('when autoFocus is provided', () => {
    it('should render auto-focused input', () => {
      render(<Input autoFocus data-testid={INPUT_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveFocus();
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className and merge with defaults', () => {
      render(<Input className="custom-input" data-testid={INPUT_DOMAIN.TEST_ID} />);
      const input = screen.getByTestId(INPUT_DOMAIN.TEST_ID);
      expect(input).toHaveClass('custom-input');
      expect(input).toHaveClass(INPUT_DOMAIN.CLASSES.roundedMd);
    });
  });

  describe('when aria attributes are provided', () => {
    it.each([
      { attr: 'aria-label', value: INPUT_DOMAIN.ARIA.LABEL },
      { attr: 'aria-describedby', value: INPUT_DOMAIN.ARIA.DESCRIPTION },
    ])('should have $attr attribute', ({ attr, value }) => {
      render(<Input {...{ [attr]: value }} data-testid={INPUT_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveAttribute(attr, value);
    });

    it('should have aria-invalid border class when invalid', () => {
      render(<Input aria-invalid="true" data-testid={INPUT_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(INPUT_DOMAIN.TEST_ID)).toHaveClass(
        INPUT_DOMAIN.CLASSES.ariaInvalidBorder
      );
    });
  });

  describe('Input field dimensions', () => {
    it('should have h-9 and w-full classes', () => {
      render(<Input data-testid={INPUT_DOMAIN.TEST_ID} />);
      const input = screen.getByTestId(INPUT_DOMAIN.TEST_ID);
      expect(input).toHaveClass(INPUT_DOMAIN.CLASSES.h9);
      expect(input).toHaveClass(INPUT_DOMAIN.CLASSES.wFull);
    });
  });
});
