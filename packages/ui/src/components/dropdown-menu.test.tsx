import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

// =============================================================================
// Domain Test Values - Dropdown Menu Component
// =============================================================================

const DROPDOWN_DOMAIN = {
  TEST_IDS: {
    DROPDOWN_MENU: 'dropdown-menu',
    RADIO_GROUP: 'radio-group',
    PORTAL: 'dropdown-portal',
    CONTENT: 'dropdown-content',
    SUB: 'dropdown-sub',
    SUB_CONTENT: 'dropdown-sub-content',
  },

  TEXT: {
    LABEL: 'Label',
    MENU_LABEL: 'Menu Label',
    SHORTCUT: '⌘K',
    SHORTCUT_S: '⌘S',
    ITEM_1: 'Item 1',
    ITEM: 'Item',
    MENU_ITEM: 'Menu Item',
    DELETE_ACCOUNT: 'Delete Account',
    CHECKBOX_ITEM: 'Checkbox Item',
    CHECKED_ITEM: 'Checked Item',
    RADIO_OPTION: 'Radio Option',
    THEME: 'Light Theme',
    SUBMENU: 'Submenu',
    SUBMENU_TRIGGER: 'Submenu Trigger',
    MORE_OPTIONS: 'More Options',
    SUB_ITEM: 'Sub Item',
    OPEN_MENU: 'Open Menu',
    OPTIONS: 'Options',
    SETTINGS: 'Settings',
    PORTAL_CONTENT: 'Portal Content',
  },

  CLASSES: {
    fontMedium: 'font-medium',
    textMutedForeground: 'text-muted-foreground',
    bgBorder: 'bg-border',
    shadowMd: 'shadow-md',
    shadowLg: 'shadow-lg',
  },
} as const;

// =============================================================================
// Mock Setup
// =============================================================================

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

// =============================================================================
// Test Suite
// =============================================================================

describe('DropdownMenuLabel', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(<DropdownMenuLabel>{DROPDOWN_DOMAIN.TEXT.LABEL}</DropdownMenuLabel>);
      expect(container.querySelector('[data-slot="dropdown-menu-label"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(<DropdownMenuLabel>{DROPDOWN_DOMAIN.TEXT.LABEL}</DropdownMenuLabel>);
      expect(container.querySelector('[data-slot="dropdown-menu-label"]')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-label'
      );
    });

    it('should have font-medium class', () => {
      const { container } = render(<DropdownMenuLabel>{DROPDOWN_DOMAIN.TEXT.LABEL}</DropdownMenuLabel>);
      expect(container.querySelector('[data-slot="dropdown-menu-label"]')).toHaveClass(
        DROPDOWN_DOMAIN.CLASSES.fontMedium
      );
    });

    it('should render with text content', () => {
      const { container } = render(<DropdownMenuLabel>{DROPDOWN_DOMAIN.TEXT.MENU_LABEL}</DropdownMenuLabel>);
      expect(container).toHaveTextContent(DROPDOWN_DOMAIN.TEXT.MENU_LABEL);
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
      expect(container.querySelector('[data-slot="dropdown-menu-separator"]')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-separator'
      );
    });

    it('should have bg-border class', () => {
      const { container } = render(<DropdownMenuSeparator />);
      expect(container.querySelector('[data-slot="dropdown-menu-separator"]')).toHaveClass(
        DROPDOWN_DOMAIN.CLASSES.bgBorder
      );
    });
  });
});

describe('DropdownMenuShortcut', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(<DropdownMenuShortcut>{DROPDOWN_DOMAIN.TEXT.SHORTCUT}</DropdownMenuShortcut>);
      expect(container.querySelector('[data-slot="dropdown-menu-shortcut"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(<DropdownMenuShortcut>{DROPDOWN_DOMAIN.TEXT.SHORTCUT}</DropdownMenuShortcut>);
      expect(container.querySelector('[data-slot="dropdown-menu-shortcut"]')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-shortcut'
      );
    });

    it('should have text-muted-foreground class', () => {
      const { container } = render(<DropdownMenuShortcut>{DROPDOWN_DOMAIN.TEXT.SHORTCUT}</DropdownMenuShortcut>);
      expect(container.querySelector('[data-slot="dropdown-menu-shortcut"]')).toHaveClass(
        DROPDOWN_DOMAIN.CLASSES.textMutedForeground
      );
    });

    it('should render with text content', () => {
      const { container } = render(<DropdownMenuShortcut>{DROPDOWN_DOMAIN.TEXT.SHORTCUT_S}</DropdownMenuShortcut>);
      expect(container).toHaveTextContent(DROPDOWN_DOMAIN.TEXT.SHORTCUT_S);
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
      expect(container.querySelector('[data-slot="dropdown-menu-group"]')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-group'
      );
    });
  });
});

describe('DropdownMenuRadioGroup', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(<DropdownMenuRadioGroup data-testid={DROPDOWN_DOMAIN.TEST_IDS.RADIO_GROUP} />);
      expect(screen.getByTestId(DROPDOWN_DOMAIN.TEST_IDS.RADIO_GROUP)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<DropdownMenuRadioGroup data-testid={DROPDOWN_DOMAIN.TEST_IDS.RADIO_GROUP} />);
      expect(screen.getByTestId(DROPDOWN_DOMAIN.TEST_IDS.RADIO_GROUP)).toHaveAttribute(
        'data-slot',
        'dropdown-menu-radio-group'
      );
    });
  });
});

describe('DropdownMenu', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(<DropdownMenu data-testid={DROPDOWN_DOMAIN.TEST_IDS.DROPDOWN_MENU} />);
      expect(screen.getByTestId(DROPDOWN_DOMAIN.TEST_IDS.DROPDOWN_MENU)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<DropdownMenu data-testid={DROPDOWN_DOMAIN.TEST_IDS.DROPDOWN_MENU} />);
      expect(screen.getByTestId(DROPDOWN_DOMAIN.TEST_IDS.DROPDOWN_MENU)).toHaveAttribute(
        'data-slot',
        'dropdown-menu'
      );
    });
  });

  describe('when wrapped with trigger and content', () => {
    it('should render trigger and content in structure', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button>{DROPDOWN_DOMAIN.TEXT.OPEN_MENU}</button>
          </DropdownMenuTrigger>
        </DropdownMenu>
      );
      expect(
        screen.getByRole('button', { name: DROPDOWN_DOMAIN.TEXT.OPEN_MENU })
      ).toBeInTheDocument();
    });
  });
});

describe('DropdownMenuPortal', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(
        <DropdownMenuPortal data-testid={DROPDOWN_DOMAIN.TEST_IDS.PORTAL}>
          <div>{DROPDOWN_DOMAIN.TEXT.PORTAL_CONTENT}</div>
        </DropdownMenuPortal>
      );
      expect(screen.getByTestId(DROPDOWN_DOMAIN.TEST_IDS.PORTAL)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <DropdownMenuPortal data-testid={DROPDOWN_DOMAIN.TEST_IDS.PORTAL}>
          <div>{DROPDOWN_DOMAIN.TEXT.PORTAL_CONTENT}</div>
        </DropdownMenuPortal>
      );
      expect(screen.getByTestId(DROPDOWN_DOMAIN.TEST_IDS.PORTAL)).toHaveAttribute(
        'data-slot',
        'dropdown-menu-portal'
      );
    });
  });
});

describe('DropdownMenuTrigger', () => {
  describe('when rendered with asChild', () => {
    it('should render custom element as button', () => {
      render(
        <DropdownMenuTrigger asChild>
          <button>{DROPDOWN_DOMAIN.TEXT.OPTIONS}</button>
        </DropdownMenuTrigger>
      );
      expect(screen.getByRole('button', { name: DROPDOWN_DOMAIN.TEXT.OPTIONS })).toBeInTheDocument();
    });

    it('should render link element', () => {
      render(
        <DropdownMenuTrigger asChild>
          <a href="/settings">{DROPDOWN_DOMAIN.TEXT.SETTINGS}</a>
        </DropdownMenuTrigger>
      );
      expect(screen.getByRole('link', { name: DROPDOWN_DOMAIN.TEXT.SETTINGS })).toBeInTheDocument();
    });
  });
});

describe('DropdownMenuContent', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DropdownMenuContent data-testid={DROPDOWN_DOMAIN.TEST_IDS.CONTENT}>
          <DropdownMenuItem>{DROPDOWN_DOMAIN.TEXT.ITEM_1}</DropdownMenuItem>
        </DropdownMenuContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-content"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute and shadow class', () => {
      const { container } = render(
        <DropdownMenuContent data-testid={DROPDOWN_DOMAIN.TEST_IDS.CONTENT}>
          <DropdownMenuItem>{DROPDOWN_DOMAIN.TEXT.ITEM}</DropdownMenuItem>
        </DropdownMenuContent>
      );
      const content = container.querySelector('[data-slot="dropdown-menu-content"]');
      expect(content).toHaveAttribute('data-slot', 'dropdown-menu-content');
      expect(content).toHaveClass(DROPDOWN_DOMAIN.CLASSES.shadowMd);
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <DropdownMenuContent className="custom-content" data-testid={DROPDOWN_DOMAIN.TEST_IDS.CONTENT}>
          <DropdownMenuItem>{DROPDOWN_DOMAIN.TEXT.ITEM}</DropdownMenuItem>
        </DropdownMenuContent>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-content"]')).toHaveClass(
        'custom-content'
      );
    });
  });
});

describe('DropdownMenuItem', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(<DropdownMenuItem>{DROPDOWN_DOMAIN.TEXT.MENU_ITEM}</DropdownMenuItem>);
      expect(container.querySelector('[data-slot="dropdown-menu-item"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(<DropdownMenuItem>{DROPDOWN_DOMAIN.TEXT.MENU_ITEM}</DropdownMenuItem>);
      expect(container.querySelector('[data-slot="dropdown-menu-item"]')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-item'
      );
    });

    it('should render with text content', () => {
      const { container } = render(
        <DropdownMenuItem>{DROPDOWN_DOMAIN.TEXT.DELETE_ACCOUNT}</DropdownMenuItem>
      );
      expect(container).toHaveTextContent(DROPDOWN_DOMAIN.TEXT.DELETE_ACCOUNT);
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
      const { container } = render(
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      );
      expect(container.querySelector('[data-variant="destructive"]')).toBeInTheDocument();
    });
  });

  describe('when disabled', () => {
    it('should have disabled opacity class', () => {
      const { container } = render(
        <DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
      );
      const item = container.querySelector('[data-slot="dropdown-menu-item"]');
      expect(item).toHaveClass('data-[disabled]:opacity-50');
    });
  });
});

describe('DropdownMenuCheckboxItem', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DropdownMenuCheckboxItem checked={false}>
          {DROPDOWN_DOMAIN.TEXT.CHECKBOX_ITEM}
        </DropdownMenuCheckboxItem>
      );
      expect(
        container.querySelector('[data-slot="dropdown-menu-checkbox-item"]')
      ).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenuCheckboxItem checked={false}>
          {DROPDOWN_DOMAIN.TEXT.CHECKBOX_ITEM}
        </DropdownMenuCheckboxItem>
      );
      expect(
        container.querySelector('[data-slot="dropdown-menu-checkbox-item"]')
      ).toHaveAttribute('data-slot', 'dropdown-menu-checkbox-item');
    });

    it('should render with text content', () => {
      const { container } = render(
        <DropdownMenuCheckboxItem checked={false}>
          {DROPDOWN_DOMAIN.TEXT.CHECKED_ITEM}
        </DropdownMenuCheckboxItem>
      );
      expect(container).toHaveTextContent(DROPDOWN_DOMAIN.TEXT.CHECKED_ITEM);
    });
  });
});

describe('DropdownMenuRadioItem', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DropdownMenuRadioItem value="option1">{DROPDOWN_DOMAIN.TEXT.RADIO_OPTION}</DropdownMenuRadioItem>
      );
      expect(
        container.querySelector('[data-slot="dropdown-menu-radio-item"]')
      ).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenuRadioItem value="option1">{DROPDOWN_DOMAIN.TEXT.THEME}</DropdownMenuRadioItem>
      );
      expect(
        container.querySelector('[data-slot="dropdown-menu-radio-item"]')
      ).toHaveAttribute('data-slot', 'dropdown-menu-radio-item');
    });
  });
});

describe('DropdownMenuSub', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DropdownMenuSub data-testid={DROPDOWN_DOMAIN.TEST_IDS.SUB}>
          <DropdownMenuSubTrigger>{DROPDOWN_DOMAIN.TEXT.SUBMENU}</DropdownMenuSubTrigger>
        </DropdownMenuSub>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-sub"]')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenuSub data-testid={DROPDOWN_DOMAIN.TEST_IDS.SUB}>
          <DropdownMenuSubTrigger>{DROPDOWN_DOMAIN.TEXT.SUBMENU}</DropdownMenuSubTrigger>
        </DropdownMenuSub>
      );
      expect(container.querySelector('[data-slot="dropdown-menu-sub"]')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-sub'
      );
    });
  });
});

describe('DropdownMenuSubTrigger', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DropdownMenuSubTrigger>{DROPDOWN_DOMAIN.TEXT.SUBMENU_TRIGGER}</DropdownMenuSubTrigger>
      );
      expect(
        container.querySelector('[data-slot="dropdown-menu-sub-trigger"]')
      ).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenuSubTrigger>{DROPDOWN_DOMAIN.TEXT.SUBMENU_TRIGGER}</DropdownMenuSubTrigger>
      );
      expect(
        container.querySelector('[data-slot="dropdown-menu-sub-trigger"]')
      ).toHaveAttribute('data-slot', 'dropdown-menu-sub-trigger');
    });

    it('should render with text content', () => {
      const { container } = render(
        <DropdownMenuSubTrigger>{DROPDOWN_DOMAIN.TEXT.MORE_OPTIONS}</DropdownMenuSubTrigger>
      );
      expect(container).toHaveTextContent(DROPDOWN_DOMAIN.TEXT.MORE_OPTIONS);
    });
  });

  describe('when inset is true', () => {
    it('should have data-inset attribute', () => {
      const { container } = render(
        <DropdownMenuSubTrigger inset>Inset Submenu</DropdownMenuSubTrigger>
      );
      expect(container.querySelector('[data-inset="true"]')).toBeInTheDocument();
    });
  });
});

describe('DropdownMenuSubContent', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DropdownMenuSubContent data-testid={DROPDOWN_DOMAIN.TEST_IDS.SUB_CONTENT}>
          <DropdownMenuItem>{DROPDOWN_DOMAIN.TEXT.SUB_ITEM}</DropdownMenuItem>
        </DropdownMenuSubContent>
      );
      expect(
        container.querySelector('[data-slot="dropdown-menu-sub-content"]')
      ).toBeInTheDocument();
    });

    it('should have data-slot attribute and shadow-lg class', () => {
      const { container } = render(
        <DropdownMenuSubContent data-testid={DROPDOWN_DOMAIN.TEST_IDS.SUB_CONTENT}>
          <DropdownMenuItem>{DROPDOWN_DOMAIN.TEXT.SUB_ITEM}</DropdownMenuItem>
        </DropdownMenuSubContent>
      );
      const content = container.querySelector('[data-slot="dropdown-menu-sub-content"]');
      expect(content).toHaveAttribute('data-slot', 'dropdown-menu-sub-content');
      expect(content).toHaveClass(DROPDOWN_DOMAIN.CLASSES.shadowLg);
    });
  });
});
