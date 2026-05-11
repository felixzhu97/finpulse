import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
} from './dropdown-menu';

describe('DropdownMenuLabel', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(<DropdownMenuLabel>Label</DropdownMenuLabel>);
      expect(container.querySelector('[data-slot="dropdown-menu-label"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(<DropdownMenuLabel>Label</DropdownMenuLabel>);
      expect(container.querySelector('[data-slot="dropdown-menu-label"]')).toHaveAttribute('data-slot', 'dropdown-menu-label');
    });

    it('should have font-medium class', () => {
      const { container } = render(<DropdownMenuLabel>Label</DropdownMenuLabel>);
      expect(container.querySelector('[data-slot="dropdown-menu-label"]')).toHaveClass('font-medium');
    });

    it('should render with text content', () => {
      const { container } = render(<DropdownMenuLabel>Menu Label</DropdownMenuLabel>);
      expect(container).toHaveTextContent('Menu Label');
    });
  });

  describe('when inset is true', () => {
    it('should have data-inset attribute', () => {
      const { container } = render(<DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>);
      expect(container.querySelector('[data-inset="true"]')).toBeInTheDocument();
    });
  });
});

describe('DropdownMenuSeparator', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(<DropdownMenuSeparator />);
      expect(container.querySelector('[data-slot="dropdown-menu-separator"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(<DropdownMenuSeparator />);
      expect(container.querySelector('[data-slot="dropdown-menu-separator"]')).toHaveAttribute('data-slot', 'dropdown-menu-separator');
    });

    it('should have bg-border class', () => {
      const { container } = render(<DropdownMenuSeparator />);
      expect(container.querySelector('[data-slot="dropdown-menu-separator"]')).toHaveClass('bg-border');
    });
  });
});

describe('DropdownMenuShortcut', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>);
      expect(container.querySelector('[data-slot="dropdown-menu-shortcut"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>);
      expect(container.querySelector('[data-slot="dropdown-menu-shortcut"]')).toHaveAttribute('data-slot', 'dropdown-menu-shortcut');
    });

    it('should have text-muted-foreground class', () => {
      const { container } = render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>);
      expect(container.querySelector('[data-slot="dropdown-menu-shortcut"]')).toHaveClass('text-muted-foreground');
    });

    it('should render with text content', () => {
      const { container } = render(<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>);
      expect(container).toHaveTextContent('⌘S');
    });
  });
});

describe('DropdownMenuGroup', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(<DropdownMenuGroup />);
      expect(container.querySelector('[data-slot="dropdown-menu-group"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(<DropdownMenuGroup />);
      expect(container.querySelector('[data-slot="dropdown-menu-group"]')).toHaveAttribute('data-slot', 'dropdown-menu-group');
    });
  });
});

describe('DropdownMenuRadioGroup', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(<DropdownMenuRadioGroup data-testid="radio-group" />);
      expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<DropdownMenuRadioGroup data-testid="radio-group" />);
      expect(screen.getByTestId('radio-group')).toHaveAttribute('data-slot', 'dropdown-menu-radio-group');
    });
  });
});
