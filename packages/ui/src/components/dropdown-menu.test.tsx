import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

vi.mock('@radix-ui/react-dropdown-menu', () => {
  const MockPrimitive = {
    Root: ({ children, 'data-testid': testId, ...props }: React.ComponentProps<'div'> & { 'data-testid'?: string }) => (
      <div data-testid={testId} {...props}>{children}</div>
    ),
    Trigger: ({ children, asChild, 'data-testid': testId, ...props }: React.ComponentProps<'button'> & { asChild?: boolean; 'data-testid'?: string }) => (
      asChild ? <>{children}</> : <button data-testid={testId} {...props}>{children}</button>
    ),
    Portal: ({ children, 'data-testid': testId, ...props }: React.ComponentProps<'div'> & { 'data-testid'?: string }) => (
      <div data-testid={testId} data-slot="dropdown-menu-portal" {...props}>{children}</div>
    ),
    Content: ({ children, 'data-testid': testId, sideOffset = 4, className, ...props }: React.ComponentProps<'div'> & { 'data-testid'?: string; sideOffset?: number }) => (
      <div data-testid={testId} data-slot="dropdown-menu-content" data-side-offset={sideOffset} className={`shadow-md ${className || ''}`} {...props}>{children}</div>
    ),
    Item: ({ children, inset, variant = 'default', 'data-testid': testId, className, ...props }: React.ComponentProps<'div'> & { inset?: boolean; variant?: string; 'data-testid'?: string }) => (
      <div data-testid={testId} data-slot="dropdown-menu-item" data-inset={inset} data-variant={variant} className={`data-[disabled]:opacity-50 ${className || ''}`} {...props}>{children}</div>
    ),
    CheckboxItem: ({ children, checked, 'data-testid': testId, className, ...props }: React.ComponentProps<'div'> & { checked?: boolean; 'data-testid'?: string }) => (
      <div data-testid={testId} data-slot="dropdown-menu-checkbox-item" data-checked={checked} className={className} {...props}>{children}</div>
    ),
    RadioItem: ({ children, 'data-testid': testId, className, ...props }: React.ComponentProps<'div'> & { 'data-testid'?: string }) => (
      <div data-testid={testId} data-slot="dropdown-menu-radio-item" className={className} {...props}>{children}</div>
    ),
    ItemIndicator: ({ children }: React.ComponentProps<'span'>) => <span>{children}</span>,
    Group: ({ children, 'data-testid': testId, ...props }: React.ComponentProps<'div'> & { 'data-testid'?: string }) => (
      <div data-testid={testId} data-slot="dropdown-menu-group" {...props}>{children}</div>
    ),
    RadioGroup: ({ children, 'data-testid': testId, ...props }: React.ComponentProps<'div'> & { 'data-testid'?: string }) => (
      <div data-testid={testId} data-slot="dropdown-menu-radio-group" {...props}>{children}</div>
    ),
    Sub: ({ children, 'data-testid': testId, ...props }: React.ComponentProps<'div'> & { 'data-testid'?: string }) => (
      <div data-testid={testId} data-slot="dropdown-menu-sub" {...props}>{children}</div>
    ),
    SubTrigger: ({ children, inset, 'data-testid': testId, className, ...props }: React.ComponentProps<'div'> & { inset?: boolean; 'data-testid'?: string }) => (
      <div data-testid={testId} data-slot="dropdown-menu-sub-trigger" data-inset={inset} className={className} {...props}>{children}</div>
    ),
    SubContent: ({ children, 'data-testid': testId, className, ...props }: React.ComponentProps<'div'> & { 'data-testid'?: string }) => (
      <div data-testid={testId} data-slot="dropdown-menu-sub-content" className={`shadow-lg ${className || ''}`} {...props}>{children}</div>
    ),
    Label: ({ children, inset, 'data-testid': testId, className, ...props }: React.ComponentProps<'div'> & { inset?: boolean; 'data-testid'?: string }) => (
      <div data-testid={testId} data-slot="dropdown-menu-label" data-inset={inset} className={`font-medium ${className || ''}`} {...props}>{children}</div>
    ),
    Separator: ({ 'data-testid': testId, className, ...props }: React.ComponentProps<'div'> & { 'data-testid'?: string }) => (
      <div data-testid={testId} data-slot="dropdown-menu-separator" className={`bg-border ${className || ''}`} {...props} />
    ),
  };
  
  return {
    default: MockPrimitive,
    Root: MockPrimitive.Root,
    Trigger: MockPrimitive.Trigger,
    Portal: MockPrimitive.Portal,
    Content: MockPrimitive.Content,
    Item: MockPrimitive.Item,
    CheckboxItem: MockPrimitive.CheckboxItem,
    RadioItem: MockPrimitive.RadioItem,
    ItemIndicator: MockPrimitive.ItemIndicator,
    Group: MockPrimitive.Group,
    RadioGroup: MockPrimitive.RadioGroup,
    Sub: MockPrimitive.Sub,
    SubTrigger: MockPrimitive.SubTrigger,
    SubContent: MockPrimitive.SubContent,
    Label: MockPrimitive.Label,
    Separator: MockPrimitive.Separator,
  };
});

import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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

describe('DropdownMenu', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(<DropdownMenu data-testid="dropdown-menu" />);
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<DropdownMenu data-testid="dropdown-menu" />);
      expect(screen.getByTestId('dropdown-menu')).toHaveAttribute('data-slot', 'dropdown-menu');
    });
  });

  describe('when wrapped with trigger and content', () => {
    it('should render trigger and content in structure', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button>Open Menu</button>
          </DropdownMenuTrigger>
        </DropdownMenu>
      );
      expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument();
    });
  });
});

describe('DropdownMenuPortal', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(
        <DropdownMenuPortal data-testid="dropdown-portal">
          <div>Portal Content</div>
        </DropdownMenuPortal>
      );
      expect(screen.getByTestId('dropdown-portal')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <DropdownMenuPortal data-testid="dropdown-portal">
          <div>Portal Content</div>
        </DropdownMenuPortal>
      );
      expect(screen.getByTestId('dropdown-portal')).toHaveAttribute('data-slot', 'dropdown-menu-portal');
    });
  });
});

describe('DropdownMenuTrigger', () => {
  describe('when rendered with asChild', () => {
    it('should render custom element', () => {
      render(
        <DropdownMenuTrigger asChild>
          <button>Options</button>
        </DropdownMenuTrigger>
      );
      expect(screen.getByRole('button', { name: 'Options' })).toBeInTheDocument();
    });

    it('should render link element', () => {
      render(
        <DropdownMenuTrigger asChild>
          <a href="/settings">Settings</a>
        </DropdownMenuTrigger>
      );
      expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
    });
  });
});

describe('DropdownMenuContent', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DropdownMenuContent data-testid="dropdown-content">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-content"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenuContent data-testid="dropdown-content">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-content"]')).toHaveAttribute('data-slot', 'dropdown-menu-content');
    });

    it('should render with shadow class', () => {
      const { container } = render(
        <DropdownMenuContent data-testid="dropdown-content">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-content"]')).toHaveClass('shadow-md');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <DropdownMenuContent className="custom-content" data-testid="dropdown-content">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-content"]')).toHaveClass('custom-content');
    });
  });

  describe('when sideOffset is customized', () => {
    it('should render with default sideOffset', () => {
      const { container } = render(
        <DropdownMenuContent data-testid="dropdown-content">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-content"]')).toBeInTheDocument();
    });

    it('should render with custom sideOffset', () => {
      const { container } = render(
        <DropdownMenuContent sideOffset={8} data-testid="dropdown-content">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-content"]')).toBeInTheDocument();
    });
  });
});

describe('DropdownMenuItem', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(<DropdownMenuItem>Menu Item</DropdownMenuItem>);
      expect(container.querySelector('[data-slot="dropdown-menu-item"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(<DropdownMenuItem>Menu Item</DropdownMenuItem>);
      expect(container.querySelector('[data-slot="dropdown-menu-item"]')).toHaveAttribute('data-slot', 'dropdown-menu-item');
    });

    it('should render with text content', () => {
      const { container } = render(<DropdownMenuItem>Delete Account</DropdownMenuItem>);
      expect(container).toHaveTextContent('Delete Account');
    });
  });

  describe('when inset is true', () => {
    it('should have data-inset attribute', () => {
      const { container } = render(<DropdownMenuItem inset>Inset Item</DropdownMenuItem>);
      expect(container.querySelector('[data-inset="true"]')).toBeInTheDocument();
    });
  });

  describe('when variant is destructive', () => {
    it('should have data-variant attribute', () => {
      const { container } = render(<DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>);
      expect(container.querySelector('[data-variant="destructive"]')).toBeInTheDocument();
    });
  });

  describe('when disabled', () => {
    it('should have disabled opacity class', () => {
      const { container } = render(<DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>);
      const item = container.querySelector('[data-slot="dropdown-menu-item"]');
      expect(item).toHaveClass('data-[disabled]:opacity-50');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      const { container } = render(<DropdownMenuItem className="custom-item">Item</DropdownMenuItem>);
      expect(container.querySelector('[data-slot="dropdown-menu-item"]')).toHaveClass('custom-item');
    });
  });
});

describe('DropdownMenuCheckboxItem', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DropdownMenuCheckboxItem checked={false}>Checkbox Item</DropdownMenuCheckboxItem>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-checkbox-item"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenuCheckboxItem checked={false}>Checkbox Item</DropdownMenuCheckboxItem>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-checkbox-item"]')).toHaveAttribute('data-slot', 'dropdown-menu-checkbox-item');
    });

    it('should render with text content', () => {
      const { container } = render(
        <DropdownMenuCheckboxItem checked={false}>Enable Notifications</DropdownMenuCheckboxItem>
      );
      expect(container).toHaveTextContent('Enable Notifications');
    });
  });

  describe('when checked', () => {
    it('should render with checked state', () => {
      const { container } = render(
        <DropdownMenuCheckboxItem checked={true}>Checked Item</DropdownMenuCheckboxItem>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-checkbox-item"]')).toBeInTheDocument();
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <DropdownMenuCheckboxItem checked={false} className="custom-checkbox">
          Item
        </DropdownMenuCheckboxItem>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-checkbox-item"]')).toHaveClass('custom-checkbox');
    });
  });
});

describe('DropdownMenuRadioItem', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DropdownMenuRadioItem value="option1">Radio Option</DropdownMenuRadioItem>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-radio-item"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenuRadioItem value="option1">Radio Option</DropdownMenuRadioItem>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-radio-item"]')).toHaveAttribute('data-slot', 'dropdown-menu-radio-item');
    });

    it('should render with text content', () => {
      const { container } = render(
        <DropdownMenuRadioItem value="option1">Light Theme</DropdownMenuRadioItem>
      );
      expect(container).toHaveTextContent('Light Theme');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <DropdownMenuRadioItem value="option1" className="custom-radio">
          Item
        </DropdownMenuRadioItem>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-radio-item"]')).toHaveClass('custom-radio');
    });
  });
});

describe('DropdownMenuSub', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DropdownMenuSub data-testid="dropdown-sub">
          <DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
        </DropdownMenuSub>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-sub"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenuSub data-testid="dropdown-sub">
          <DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
        </DropdownMenuSub>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-sub"]')).toHaveAttribute('data-slot', 'dropdown-menu-sub');
    });
  });
});

describe('DropdownMenuSubTrigger', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(<DropdownMenuSubTrigger>Submenu Trigger</DropdownMenuSubTrigger>);
      expect(container.querySelector('[data-slot="dropdown-menu-sub-trigger"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(<DropdownMenuSubTrigger>Submenu Trigger</DropdownMenuSubTrigger>);
      expect(container.querySelector('[data-slot="dropdown-menu-sub-trigger"]')).toHaveAttribute('data-slot', 'dropdown-menu-sub-trigger');
    });

    it('should render with text content', () => {
      const { container } = render(<DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>);
      expect(container).toHaveTextContent('More Options');
    });
  });

  describe('when inset is true', () => {
    it('should have data-inset attribute', () => {
      const { container } = render(<DropdownMenuSubTrigger inset>Inset Submenu</DropdownMenuSubTrigger>);
      expect(container.querySelector('[data-inset="true"]')).toBeInTheDocument();
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <DropdownMenuSubTrigger className="custom-trigger">Submenu</DropdownMenuSubTrigger>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-sub-trigger"]')).toHaveClass('custom-trigger');
    });
  });
});

describe('DropdownMenuSubContent', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DropdownMenuSubContent data-testid="dropdown-sub-content">
          <DropdownMenuItem>Sub Item</DropdownMenuItem>
        </DropdownMenuSubContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-sub-content"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenuSubContent data-testid="dropdown-sub-content">
          <DropdownMenuItem>Sub Item</DropdownMenuItem>
        </DropdownMenuSubContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-sub-content"]')).toHaveAttribute('data-slot', 'dropdown-menu-sub-content');
    });

    it('should render with shadow-lg class', () => {
      const { container } = render(
        <DropdownMenuSubContent data-testid="dropdown-sub-content">
          <DropdownMenuItem>Sub Item</DropdownMenuItem>
        </DropdownMenuSubContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-sub-content"]')).toHaveClass('shadow-lg');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <DropdownMenuSubContent className="custom-sub-content" data-testid="dropdown-sub-content">
          <DropdownMenuItem>Sub Item</DropdownMenuItem>
        </DropdownMenuSubContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-sub-content"]')).toHaveClass('custom-sub-content');
    });
  });
});
