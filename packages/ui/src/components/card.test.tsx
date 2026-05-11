import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from './card';

// =============================================================================
// Domain Test Values - Card Component
// =============================================================================

const CARD_DOMAIN = {
  TEST_IDS: {
    CARD: 'card',
    HEADER: 'card-header',
    TITLE: 'card-title',
    DESCRIPTION: 'card-description',
    ACTION: 'card-action',
    CONTENT: 'card-content',
    FOOTER: 'card-footer',
  },

  TEXT: {
    CARD: 'Card Content',
    HEADER: 'Header',
    TITLE: 'Card Title',
    DESCRIPTION: 'Card Description',
    ACTION: 'Action',
    CONTENT: 'Card content goes here',
    BUTTON: 'Action',
    EDIT: 'Edit',
  },

  CLASSES: {
    roundedXl: 'rounded-xl',
    border: 'border',
    grid: 'grid',
    fontSemibold: 'font-semibold',
    leadingNone: 'leading-none',
    textSm: 'text-sm',
    textMutedForeground: 'text-muted-foreground',
    px6: 'px-6',
    flex: 'flex',
    itemsCenter: 'items-center',
  },
} as const;

// =============================================================================
// Test Factories
// =============================================================================

const renderCard = (ui: React.ReactElement, testId?: string) =>
  render(ui);

// =============================================================================
// Test Suite
// =============================================================================

describe('Card', () => {
  describe('when rendered with default props', () => {
    it('should render without crashing', () => {
      renderCard(<Card data-testid={CARD_DOMAIN.TEST_IDS.CARD}>{CARD_DOMAIN.TEXT.CARD}</Card>);
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.CARD)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      renderCard(<Card data-testid={CARD_DOMAIN.TEST_IDS.CARD}>{CARD_DOMAIN.TEXT.CARD}</Card>);
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.CARD)).toHaveAttribute('data-slot', 'card');
    });

    it('should render children', () => {
      renderCard(
        <Card data-testid={CARD_DOMAIN.TEST_IDS.CARD}><p>{CARD_DOMAIN.TEXT.CARD}</p></Card>
      );
      expect(screen.getByText(CARD_DOMAIN.TEXT.CARD)).toBeInTheDocument();
    });

    it('should have rounded-xl and border classes', () => {
      renderCard(<Card data-testid={CARD_DOMAIN.TEST_IDS.CARD}>{CARD_DOMAIN.TEXT.CARD}</Card>);
      const card = screen.getByTestId(CARD_DOMAIN.TEST_IDS.CARD);
      expect(card).toHaveClass(CARD_DOMAIN.CLASSES.roundedXl);
      expect(card).toHaveClass(CARD_DOMAIN.CLASSES.border);
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      renderCard(
        <Card className="custom-card" data-testid={CARD_DOMAIN.TEST_IDS.CARD}>
          {CARD_DOMAIN.TEXT.CARD}
        </Card>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.CARD)).toHaveClass('custom-card');
    });

    it('should merge with default classes', () => {
      renderCard(
        <Card className="custom-class" data-testid={CARD_DOMAIN.TEST_IDS.CARD}>
          {CARD_DOMAIN.TEXT.CARD}
        </Card>
      );
      const card = screen.getByTestId(CARD_DOMAIN.TEST_IDS.CARD);
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass(CARD_DOMAIN.CLASSES.roundedXl);
    });
  });
});

describe('CardHeader', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      renderCard(
        <CardHeader data-testid={CARD_DOMAIN.TEST_IDS.HEADER}>
          {CARD_DOMAIN.TEXT.HEADER}
        </CardHeader>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.HEADER)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      renderCard(
        <CardHeader data-testid={CARD_DOMAIN.TEST_IDS.HEADER}>
          {CARD_DOMAIN.TEXT.HEADER}
        </CardHeader>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.HEADER)).toHaveAttribute(
        'data-slot',
        CARD_DOMAIN.TEST_IDS.HEADER
      );
    });

    it('should render children', () => {
      renderCard(
        <CardHeader data-testid={CARD_DOMAIN.TEST_IDS.HEADER}>
          <CardTitle>{CARD_DOMAIN.TEXT.TITLE}</CardTitle>
        </CardHeader>
      );
      expect(screen.getByText(CARD_DOMAIN.TEXT.TITLE)).toBeInTheDocument();
    });

    it('should have grid class', () => {
      renderCard(
        <CardHeader data-testid={CARD_DOMAIN.TEST_IDS.HEADER}>
          {CARD_DOMAIN.TEXT.HEADER}
        </CardHeader>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.HEADER)).toHaveClass(CARD_DOMAIN.CLASSES.grid);
    });
  });
});

describe('CardTitle', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      renderCard(
        <CardTitle data-testid={CARD_DOMAIN.TEST_IDS.TITLE}>
          {CARD_DOMAIN.TEXT.TITLE}
        </CardTitle>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.TITLE)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      renderCard(
        <CardTitle data-testid={CARD_DOMAIN.TEST_IDS.TITLE}>
          {CARD_DOMAIN.TEXT.TITLE}
        </CardTitle>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.TITLE)).toHaveAttribute(
        'data-slot',
        CARD_DOMAIN.TEST_IDS.TITLE
      );
    });

    it('should render with text content', () => {
      renderCard(
        <CardTitle data-testid={CARD_DOMAIN.TEST_IDS.TITLE}>
          {CARD_DOMAIN.TEXT.TITLE}
        </CardTitle>
      );
      expect(screen.getByText(CARD_DOMAIN.TEXT.TITLE)).toBeInTheDocument();
    });

    it('should have font-semibold and leading-none classes', () => {
      renderCard(
        <CardTitle data-testid={CARD_DOMAIN.TEST_IDS.TITLE}>
          {CARD_DOMAIN.TEXT.TITLE}
        </CardTitle>
      );
      const title = screen.getByTestId(CARD_DOMAIN.TEST_IDS.TITLE);
      expect(title).toHaveClass(CARD_DOMAIN.CLASSES.fontSemibold);
      expect(title).toHaveClass(CARD_DOMAIN.CLASSES.leadingNone);
    });
  });
});

describe('CardDescription', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      renderCard(
        <CardDescription data-testid={CARD_DOMAIN.TEST_IDS.DESCRIPTION}>
          {CARD_DOMAIN.TEXT.DESCRIPTION}
        </CardDescription>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.DESCRIPTION)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      renderCard(
        <CardDescription data-testid={CARD_DOMAIN.TEST_IDS.DESCRIPTION}>
          {CARD_DOMAIN.TEXT.DESCRIPTION}
        </CardDescription>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.DESCRIPTION)).toHaveAttribute(
        'data-slot',
        CARD_DOMAIN.TEST_IDS.DESCRIPTION
      );
    });

    it('should render with text content', () => {
      renderCard(
        <CardDescription data-testid={CARD_DOMAIN.TEST_IDS.DESCRIPTION}>
          {CARD_DOMAIN.TEXT.DESCRIPTION}
        </CardDescription>
      );
      expect(screen.getByText(CARD_DOMAIN.TEXT.DESCRIPTION)).toBeInTheDocument();
    });

    it('should have text-sm and text-muted-foreground classes', () => {
      renderCard(
        <CardDescription data-testid={CARD_DOMAIN.TEST_IDS.DESCRIPTION}>
          {CARD_DOMAIN.TEXT.DESCRIPTION}
        </CardDescription>
      );
      const desc = screen.getByTestId(CARD_DOMAIN.TEST_IDS.DESCRIPTION);
      expect(desc).toHaveClass(CARD_DOMAIN.CLASSES.textSm);
      expect(desc).toHaveClass(CARD_DOMAIN.CLASSES.textMutedForeground);
    });
  });
});

describe('CardAction', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      renderCard(
        <CardAction data-testid={CARD_DOMAIN.TEST_IDS.ACTION}>
          {CARD_DOMAIN.TEXT.ACTION}
        </CardAction>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.ACTION)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      renderCard(
        <CardAction data-testid={CARD_DOMAIN.TEST_IDS.ACTION}>
          {CARD_DOMAIN.TEXT.ACTION}
        </CardAction>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.ACTION)).toHaveAttribute(
        'data-slot',
        CARD_DOMAIN.TEST_IDS.ACTION
      );
    });

    it('should render children', () => {
      renderCard(
        <CardAction data-testid={CARD_DOMAIN.TEST_IDS.ACTION}>
          <button>{CARD_DOMAIN.TEXT.EDIT}</button>
        </CardAction>
      );
      expect(screen.getByRole('button', { name: CARD_DOMAIN.TEXT.EDIT })).toBeInTheDocument();
    });
  });
});

describe('CardContent', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      renderCard(
        <CardContent data-testid={CARD_DOMAIN.TEST_IDS.CONTENT}>
          {CARD_DOMAIN.TEXT.CARD}
        </CardContent>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.CONTENT)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      renderCard(
        <CardContent data-testid={CARD_DOMAIN.TEST_IDS.CONTENT}>
          {CARD_DOMAIN.TEXT.CARD}
        </CardContent>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.CONTENT)).toHaveAttribute(
        'data-slot',
        CARD_DOMAIN.TEST_IDS.CONTENT
      );
    });

    it('should render children', () => {
      renderCard(
        <CardContent data-testid={CARD_DOMAIN.TEST_IDS.CONTENT}>
          <p>{CARD_DOMAIN.TEXT.CARD}</p>
        </CardContent>
      );
      expect(screen.getByText(CARD_DOMAIN.TEXT.CARD)).toBeInTheDocument();
    });

    it('should have px-6 class', () => {
      renderCard(
        <CardContent data-testid={CARD_DOMAIN.TEST_IDS.CONTENT}>
          {CARD_DOMAIN.TEXT.CARD}
        </CardContent>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.CONTENT)).toHaveClass(CARD_DOMAIN.CLASSES.px6);
    });
  });
});

describe('CardFooter', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      renderCard(
        <CardFooter data-testid={CARD_DOMAIN.TEST_IDS.FOOTER}>
          {CARD_DOMAIN.TEXT.CARD}
        </CardFooter>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.FOOTER)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      renderCard(
        <CardFooter data-testid={CARD_DOMAIN.TEST_IDS.FOOTER}>
          {CARD_DOMAIN.TEXT.CARD}
        </CardFooter>
      );
      expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.FOOTER)).toHaveAttribute(
        'data-slot',
        CARD_DOMAIN.TEST_IDS.FOOTER
      );
    });

    it('should render children', () => {
      renderCard(
        <CardFooter data-testid={CARD_DOMAIN.TEST_IDS.FOOTER}>
          <button>{CARD_DOMAIN.TEXT.BUTTON}</button>
        </CardFooter>
      );
      expect(screen.getByRole('button', { name: CARD_DOMAIN.TEXT.BUTTON })).toBeInTheDocument();
    });

    it('should have flex, items-center, and px-6 classes', () => {
      renderCard(
        <CardFooter data-testid={CARD_DOMAIN.TEST_IDS.FOOTER}>
          {CARD_DOMAIN.TEXT.CARD}
        </CardFooter>
      );
      const footer = screen.getByTestId(CARD_DOMAIN.TEST_IDS.FOOTER);
      expect(footer).toHaveClass(CARD_DOMAIN.CLASSES.flex);
      expect(footer).toHaveClass(CARD_DOMAIN.CLASSES.itemsCenter);
      expect(footer).toHaveClass(CARD_DOMAIN.CLASSES.px6);
    });
  });
});

describe('Card integration', () => {
  it('should render complete Card structure', () => {
    render(
      <Card data-testid={CARD_DOMAIN.TEST_IDS.CARD}>
        <CardHeader data-testid={CARD_DOMAIN.TEST_IDS.HEADER}>
          <CardTitle data-testid={CARD_DOMAIN.TEST_IDS.TITLE}>
            {CARD_DOMAIN.TEXT.TITLE}
          </CardTitle>
          <CardDescription data-testid={CARD_DOMAIN.TEST_IDS.DESCRIPTION}>
            {CARD_DOMAIN.TEXT.DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent data-testid={CARD_DOMAIN.TEST_IDS.CONTENT}>
          <p>{CARD_DOMAIN.TEXT.CONTENT}</p>
        </CardContent>
        <CardFooter data-testid={CARD_DOMAIN.TEST_IDS.FOOTER}>
          <button>{CARD_DOMAIN.TEXT.BUTTON}</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.CARD)).toBeInTheDocument();
    expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.HEADER)).toBeInTheDocument();
    expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.TITLE)).toBeInTheDocument();
    expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.CONTENT)).toBeInTheDocument();
    expect(screen.getByTestId(CARD_DOMAIN.TEST_IDS.FOOTER)).toBeInTheDocument();
  });
});
