import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarFallback } from './avatar';

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
