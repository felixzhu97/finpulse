import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Progress } from './progress';

describe('Progress', () => {
  describe('when rendered with default props', () => {
    it('should render without crashing', () => {
      render(<Progress data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Progress data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveAttribute('data-slot', 'progress');
    });

    it('should have default progress indicator', () => {
      const { container } = render(<Progress data-testid="progress" />);
      const indicator = container.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toBeInTheDocument();
    });

    it('should have rounded-full class', () => {
      render(<Progress data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveClass('rounded-full');
    });

    it('should have h-2 class for height', () => {
      render(<Progress data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveClass('h-2');
    });
  });

  describe('when value prop is provided', () => {
    it('should render with value of 0', () => {
      render(<Progress value={0} data-testid="progress" />);
      const indicator = screen.getByTestId('progress').querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveAttribute('style', expect.stringContaining('100%'));
    });

    it('should render with value of 50', () => {
      render(<Progress value={50} data-testid="progress" />);
      const indicator = screen.getByTestId('progress').querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveAttribute('style', expect.stringContaining('50%'));
    });

    it('should render with value of 100', () => {
      render(<Progress value={100} data-testid="progress" />);
      const indicator = screen.getByTestId('progress').querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveAttribute('style', expect.stringContaining('0%'));
    });

    it('should render with value of 75', () => {
      render(<Progress value={75} data-testid="progress" />);
      const indicator = screen.getByTestId('progress').querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveAttribute('style', expect.stringContaining('25%'));
    });
  });

  describe('when value is undefined', () => {
    it('should render indicator at 100% when value is undefined', () => {
      render(<Progress value={undefined} data-testid="progress" />);
      const indicator = screen.getByTestId('progress').querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveAttribute('style', expect.stringContaining('100%'));
    });

    it('should render indicator at 100% when value is null', () => {
      render(<Progress value={null as unknown as undefined} data-testid="progress" />);
      const indicator = screen.getByTestId('progress').querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveAttribute('style', expect.stringContaining('100%'));
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      render(<Progress className="custom-progress" data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveClass('custom-progress');
    });

    it('should merge with default classes', () => {
      render(<Progress className="custom-class" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('custom-class');
      expect(progress).toHaveClass('rounded-full');
    });
  });

  describe('when additional props are passed', () => {
    it('should pass through id attribute', () => {
      render(<Progress id="progress-1" data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveAttribute('id', 'progress-1');
    });
  });

  describe('indicator behavior', () => {
    it('indicator should have bg-primary class', () => {
      const { container } = render(<Progress data-testid="progress" />);
      const indicator = container.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveClass('bg-primary');
    });

    it('indicator should have h-full class', () => {
      const { container } = render(<Progress data-testid="progress" />);
      const indicator = container.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveClass('h-full');
    });

    it('indicator should have flex-1 class', () => {
      const { container } = render(<Progress data-testid="progress" />);
      const indicator = container.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveClass('flex-1');
    });

    it('indicator should have transition-all class', () => {
      const { container } = render(<Progress data-testid="progress" />);
      const indicator = container.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveClass('transition-all');
    });
  });
});
