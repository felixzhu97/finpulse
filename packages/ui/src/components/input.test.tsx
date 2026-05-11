import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  describe('when rendered with default props', () => {
    it('should render without crashing', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('should render as an input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveProperty('tagName', 'INPUT');
    });

    it('should have data-slot attribute', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('data-slot', 'input');
    });

    it('should have rounded-md class', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('rounded-md');
    });

    it('should have border class', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border');
    });
  });

  describe('when type prop is specified', () => {
    it('should render as email input', () => {
      render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    });

    it('should render as password input', () => {
      render(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('should render as number input', () => {
      render(<Input type="number" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });

    it('should render as search input', () => {
      render(<Input type="search" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'search');
    });

    it('should render as tel input', () => {
      render(<Input type="tel" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'tel');
    });

    it('should render as url input', () => {
      render(<Input type="url" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'url');
    });
  });

  describe('when placeholder is provided', () => {
    it('should render with placeholder text', () => {
      render(<Input placeholder="Enter text..." data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('placeholder', 'Enter text...');
    });
  });

  describe('when value is provided', () => {
    it('should render with value', () => {
      render(<Input value="Test Value" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('Test Value');
    });

    it('should display value correctly', () => {
      const { rerender } = render(<Input value="Initial" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('Initial');

      rerender(<Input value="Updated" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('Updated');
    });
  });

  describe('when disabled', () => {
    it('should render disabled input', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toBeDisabled();
    });

    it('should have disabled cursor', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should have disabled opacity', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('disabled:opacity-50');
    });
  });

  describe('when onChange handler is provided', () => {
    it('should call onChange when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} data-testid="input" />);
      await user.type(screen.getByTestId('input'), 'Hello');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value when typing', async () => {
      const user = userEvent.setup();

      render(<Input data-testid="input" />);
      await user.type(screen.getByTestId('input'), 'Hello World');

      expect(screen.getByTestId('input')).toHaveValue('Hello World');
    });
  });

  describe('when readOnly', () => {
    it('should render readonly input', () => {
      render(<Input readOnly value="Read Only" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('readonly');
    });

    it('should not allow typing when readonly', async () => {
      const user = userEvent.setup();

      render(<Input readOnly value="Read Only" data-testid="input" />);
      await user.click(screen.getByTestId('input'));

      expect(screen.getByTestId('input')).toHaveValue('Read Only');
    });
  });

  describe('when required', () => {
    it('should render required input', () => {
      render(<Input required data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('required');
    });
  });

  describe('when name prop is provided', () => {
    it('should have correct name attribute', () => {
      render(<Input name="username" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('name', 'username');
    });
  });

  describe('when id prop is provided', () => {
    it('should have correct id attribute', () => {
      render(<Input id="username-input" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('id', 'username-input');
    });
  });

  describe('when autoFocus is provided', () => {
    it('should render auto-focused input', () => {
      render(<Input autoFocus data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveFocus();
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      render(<Input className="custom-input" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('custom-input');
    });

    it('should merge with default classes', () => {
      render(<Input className="custom-class" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('rounded-md');
    });
  });

  describe('when aria attributes are provided', () => {
    it('should have aria-label', () => {
      render(<Input aria-label="Search input" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-label', 'Search input');
    });

    it('should have aria-invalid when invalid', () => {
      render(<Input aria-invalid="true" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby for accessibility', () => {
      render(<Input aria-describedby="description" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('when aria-invalid is true', () => {
    it('should have destructive border class', () => {
      render(<Input aria-invalid="true" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('aria-invalid:border-destructive');
    });
  });

  describe('Input field dimensions', () => {
    it('should have h-9 class for height', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('h-9');
    });

    it('should have w-full class for width', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('w-full');
    });
  });
});
