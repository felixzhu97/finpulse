import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// =============================================================================
// Domain Test Values - Avatar Component
// =============================================================================

const AVATAR_DOMAIN = {
  TEST_ID: 'avatar',
  IMAGE_TEST_ID: 'avatar-image',
  FALLBACK_TEST_ID: 'avatar-fallback',

  FALLBACK: {
    TEXT: {
      TWO_LETTER: 'AB',
      INITIALS: 'JD',
    },
  },

  IMAGE: {
    SRC: 'https://example.com/avatar.png',
    ALT: 'User profile photo',
  },

  CLASSES: {
    roundedFull: 'rounded-full',
    size8: 'size-8',
    bgMuted: 'bg-muted',
    flex: 'flex',
    itemsCenter: 'items-center',
    aspectSquare: 'aspect-square',
    sizeFull: 'size-full',
  },
} as const;

// =============================================================================
// Mock Setup
// =============================================================================

vi.mock('@radix-ui/react-avatar', () => {
  const MockRoot = ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-slot="avatar" {...props}>{children}</div>
  );
  const MockImage = ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-slot="avatar-image" {...props}>{children}</div>
  );
  const MockFallback = ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-slot="avatar-fallback" {...props}>{children}</div>
  );

  return {
    __esModule: true,
    default: {
      Root: MockRoot,
      Image: MockImage,
      Fallback: MockFallback,
    },
    Root: MockRoot,
    Image: MockImage,
    Fallback: MockFallback,
  };
});

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

// =============================================================================
// Test Suite
// =============================================================================

describe('Avatar', () => {
  describe('when rendered with default props', () => {
    it('should render without crashing', () => {
      render(<Avatar data-testid={AVATAR_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(AVATAR_DOMAIN.TEST_ID)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Avatar data-testid={AVATAR_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(AVATAR_DOMAIN.TEST_ID)).toHaveAttribute(
        'data-slot',
        'avatar'
      );
    });

    it('should have rounded-full and size-8 classes', () => {
      render(<Avatar data-testid={AVATAR_DOMAIN.TEST_ID} />);
      const avatar = screen.getByTestId(AVATAR_DOMAIN.TEST_ID);
      expect(avatar).toHaveClass(AVATAR_DOMAIN.CLASSES.roundedFull);
      expect(avatar).toHaveClass(AVATAR_DOMAIN.CLASSES.size8);
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className and merge with defaults', () => {
      render(<Avatar className="custom-avatar" data-testid={AVATAR_DOMAIN.TEST_ID} />);
      const avatar = screen.getByTestId(AVATAR_DOMAIN.TEST_ID);
      expect(avatar).toHaveClass('custom-avatar');
      expect(avatar).toHaveClass(AVATAR_DOMAIN.CLASSES.roundedFull);
    });
  });

  describe('when additional props are passed', () => {
    it('should pass through id attribute', () => {
      render(<Avatar id="avatar-1" data-testid={AVATAR_DOMAIN.TEST_ID} />);
      expect(screen.getByTestId(AVATAR_DOMAIN.TEST_ID)).toHaveAttribute('id', 'avatar-1');
    });
  });
});

describe('AvatarFallback', () => {
  describe('when rendered within Avatar', () => {
    it('should render without crashing', () => {
      render(
        <Avatar data-testid={AVATAR_DOMAIN.TEST_ID}>
          <AvatarFallback>{AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER}</AvatarFallback>
        </Avatar>
      );
      expect(
        screen.getByText(AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER)
      ).toBeInTheDocument();
    });

    it('should render with text content', () => {
      render(
        <Avatar data-testid={AVATAR_DOMAIN.TEST_ID}>
          <AvatarFallback>{AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER}</AvatarFallback>
        </Avatar>
      );
      expect(
        screen.getByText(AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER)
      ).toHaveTextContent(AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER);
    });

    it('should have bg-muted, flex, and items-center classes', () => {
      render(
        <Avatar data-testid={AVATAR_DOMAIN.TEST_ID}>
          <AvatarFallback>{AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER}</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByText(AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER);
      expect(fallback).toHaveClass(AVATAR_DOMAIN.CLASSES.bgMuted);
      expect(fallback).toHaveClass(AVATAR_DOMAIN.CLASSES.flex);
      expect(fallback).toHaveClass(AVATAR_DOMAIN.CLASSES.itemsCenter);
    });

    it('should have data-slot attribute', () => {
      render(
        <Avatar data-testid={AVATAR_DOMAIN.TEST_ID}>
          <AvatarFallback>{AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER}</AvatarFallback>
        </Avatar>
      );
      expect(
        screen.getByText(AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER)
      ).toHaveAttribute('data-slot', 'avatar-fallback');
    });
  });
});

describe('AvatarImage', () => {
  describe('when rendered with src attribute', () => {
    it('should render without crashing', () => {
      render(
        <Avatar>
          <AvatarImage
            data-testid={AVATAR_DOMAIN.IMAGE_TEST_ID}
            src={AVATAR_DOMAIN.IMAGE.SRC}
          />
          <AvatarFallback>{AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER}</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId(AVATAR_DOMAIN.IMAGE_TEST_ID)).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Avatar>
          <AvatarImage
            data-testid={AVATAR_DOMAIN.IMAGE_TEST_ID}
            src={AVATAR_DOMAIN.IMAGE.SRC}
          />
          <AvatarFallback>{AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER}</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId(AVATAR_DOMAIN.IMAGE_TEST_ID)).toHaveAttribute(
        'data-slot',
        'avatar-image'
      );
    });

    it('should have aspect-square and size-full classes', () => {
      render(
        <Avatar>
          <AvatarImage
            data-testid={AVATAR_DOMAIN.IMAGE_TEST_ID}
            src={AVATAR_DOMAIN.IMAGE.SRC}
          />
          <AvatarFallback>{AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER}</AvatarFallback>
        </Avatar>
      );
      const image = screen.getByTestId(AVATAR_DOMAIN.IMAGE_TEST_ID);
      expect(image).toHaveClass(AVATAR_DOMAIN.CLASSES.aspectSquare);
      expect(image).toHaveClass(AVATAR_DOMAIN.CLASSES.sizeFull);
    });

    it('should pass src and alt attributes', () => {
      render(
        <Avatar>
          <AvatarImage
            data-testid={AVATAR_DOMAIN.IMAGE_TEST_ID}
            src={AVATAR_DOMAIN.IMAGE.SRC}
            alt={AVATAR_DOMAIN.IMAGE.ALT}
          />
          <AvatarFallback>{AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER}</AvatarFallback>
        </Avatar>
      );
      const image = screen.getByTestId(AVATAR_DOMAIN.IMAGE_TEST_ID);
      expect(image).toHaveAttribute('src', AVATAR_DOMAIN.IMAGE.SRC);
      expect(image).toHaveAttribute('alt', AVATAR_DOMAIN.IMAGE.ALT);
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className and merge with defaults', () => {
      render(
        <Avatar>
          <AvatarImage
            data-testid={AVATAR_DOMAIN.IMAGE_TEST_ID}
            src={AVATAR_DOMAIN.IMAGE.SRC}
            className="w-16 h-16"
          />
          <AvatarFallback>{AVATAR_DOMAIN.FALLBACK.TEXT.TWO_LETTER}</AvatarFallback>
        </Avatar>
      );
      const image = screen.getByTestId(AVATAR_DOMAIN.IMAGE_TEST_ID);
      expect(image).toHaveClass('w-16');
      expect(image).toHaveClass('h-16');
      expect(image).toHaveClass(AVATAR_DOMAIN.CLASSES.aspectSquare);
      expect(image).toHaveClass(AVATAR_DOMAIN.CLASSES.sizeFull);
    });
  });

  describe('integration with Avatar and AvatarFallback', () => {
    it('should render image and fallback together', () => {
      render(
        <Avatar data-testid={AVATAR_DOMAIN.TEST_ID}>
          <AvatarImage
            data-testid={AVATAR_DOMAIN.IMAGE_TEST_ID}
            src={AVATAR_DOMAIN.IMAGE.SRC}
          />
          <AvatarFallback data-testid={AVATAR_DOMAIN.FALLBACK_TEST_ID}>
            {AVATAR_DOMAIN.FALLBACK.TEXT.INITIALS}
          </AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId(AVATAR_DOMAIN.IMAGE_TEST_ID)).toBeInTheDocument();
      expect(screen.getByTestId(AVATAR_DOMAIN.FALLBACK_TEST_ID)).toBeInTheDocument();
    });
  });
});
