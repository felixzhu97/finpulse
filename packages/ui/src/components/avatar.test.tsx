import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock @radix-ui/react-avatar to simulate image loading state
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

describe('Avatar', () => {
  describe('when rendered with default props', () => {
    it('should render without crashing', () => {
      render(<Avatar data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Avatar data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveAttribute('data-slot', 'avatar');
    });

    it('should have rounded-full class', () => {
      render(<Avatar data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('rounded-full');
    });

    it('should have size-8 class', () => {
      render(<Avatar data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('size-8');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      render(<Avatar className="custom-avatar" data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('custom-avatar');
    });

    it('should merge with default classes', () => {
      render(<Avatar className="custom-class" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('custom-class');
      expect(avatar).toHaveClass('rounded-full');
    });
  });

  describe('when additional props are passed', () => {
    it('should pass through id attribute', () => {
      render(<Avatar id="avatar-1" data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveAttribute('id', 'avatar-1');
    });
  });
});

describe('AvatarFallback', () => {
  describe('when rendered within Avatar', () => {
    it('should render without crashing when inside Avatar', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('should render with text content', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AB')).toHaveTextContent('AB');
    });

    it('should have bg-muted class', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AB')).toHaveClass('bg-muted');
    });

    it('should have flex class', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AB')).toHaveClass('flex');
    });

    it('should have items-center class', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AB')).toHaveClass('items-center');
    });

    it('should have data-slot attribute', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AB')).toHaveAttribute('data-slot', 'avatar-fallback');
    });
  });
});

describe('Avatar integration', () => {
  it('should render Avatar with Fallback content', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});

describe('AvatarImage', () => {
  describe('when rendered with src attribute', () => {
    it('should render without crashing', () => {
      render(
        <Avatar>
          <AvatarImage data-testid="avatar-image" src="https://example.com/avatar.png" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Avatar>
          <AvatarImage data-testid="avatar-image" src="https://example.com/avatar.png" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar-image')).toHaveAttribute('data-slot', 'avatar-image');
    });

    it('should have aspect-square class', () => {
      render(
        <Avatar>
          <AvatarImage data-testid="avatar-image" src="https://example.com/avatar.png" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar-image')).toHaveClass('aspect-square');
    });

    it('should have size-full class', () => {
      render(
        <Avatar>
          <AvatarImage data-testid="avatar-image" src="https://example.com/avatar.png" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar-image')).toHaveClass('size-full');
    });

    it('should pass src attribute to image element', () => {
      render(
        <Avatar>
          <AvatarImage data-testid="avatar-image" src="https://example.com/avatar.png" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar-image')).toHaveAttribute('src', 'https://example.com/avatar.png');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      render(
        <Avatar>
          <AvatarImage data-testid="avatar-image" src="https://example.com/avatar.png" className="custom-image" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar-image')).toHaveClass('custom-image');
    });

    it('should merge with default classes', () => {
      render(
        <Avatar>
          <AvatarImage data-testid="avatar-image" src="https://example.com/avatar.png" className="w-16 h-16" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      const image = screen.getByTestId('avatar-image');
      expect(image).toHaveClass('w-16');
      expect(image).toHaveClass('h-16');
      expect(image).toHaveClass('aspect-square');
      expect(image).toHaveClass('size-full');
    });
  });

  describe('when additional props are passed', () => {
    it('should pass through id attribute', () => {
      render(
        <Avatar>
          <AvatarImage data-testid="avatar-image" id="profile-image" src="https://example.com/avatar.png" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar-image')).toHaveAttribute('id', 'profile-image');
    });

    it('should pass through alt attribute', () => {
      render(
        <Avatar>
          <AvatarImage data-testid="avatar-image" src="https://example.com/avatar.png" alt="User profile photo" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar-image')).toHaveAttribute('alt', 'User profile photo');
    });
  });

  describe('integration with Avatar and AvatarFallback', () => {
    it('should render image before fallback content', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarImage data-testid="avatar-image" src="https://example.com/avatar.png" />
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    });
  });
});
