import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from './card';

describe('Card', () => {
  describe('when rendered with default props', () => {
    it('should render without crashing', () => {
      render(<Card data-testid="card">Card Content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card');
    });

    it('should render children', () => {
      render(<Card data-testid="card"><p>Card Content</p></Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should have rounded-xl class', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('rounded-xl');
    });

    it('should have border class', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('border');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      render(<Card className="custom-card" data-testid="card">Custom</Card>);
      expect(screen.getByTestId('card')).toHaveClass('custom-card');
    });

    it('should merge with default classes', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('rounded-xl');
    });
  });
});

describe('CardHeader', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(<CardHeader data-testid="card-header">Header</CardHeader>);
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<CardHeader data-testid="card-header">Header</CardHeader>);
      expect(screen.getByTestId('card-header')).toHaveAttribute('data-slot', 'card-header');
    });

    it('should render children', () => {
      render(<CardHeader data-testid="card-header"><CardTitle>Title</CardTitle></CardHeader>);
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should have flex-col class', () => {
      render(<CardHeader data-testid="card-header">Header</CardHeader>);
      const header = screen.getByTestId('card-header');
      expect(header).toHaveClass('grid');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      render(<CardHeader className="custom-header" data-testid="card-header">Header</CardHeader>);
      expect(screen.getByTestId('card-header')).toHaveClass('custom-header');
    });
  });
});

describe('CardTitle', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>);
      expect(screen.getByTestId('card-title')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>);
      expect(screen.getByTestId('card-title')).toHaveAttribute('data-slot', 'card-title');
    });

    it('should render with text content', () => {
      render(<CardTitle data-testid="card-title">Card Title</CardTitle>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('should have font-semibold class', () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>);
      expect(screen.getByTestId('card-title')).toHaveClass('font-semibold');
    });

    it('should have leading-none class', () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>);
      expect(screen.getByTestId('card-title')).toHaveClass('leading-none');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      render(<CardTitle className="custom-title" data-testid="card-title">Title</CardTitle>);
      expect(screen.getByTestId('card-title')).toHaveClass('custom-title');
    });
  });
});

describe('CardDescription', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(<CardDescription data-testid="card-description">Description</CardDescription>);
      expect(screen.getByTestId('card-description')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<CardDescription data-testid="card-description">Description</CardDescription>);
      expect(screen.getByTestId('card-description')).toHaveAttribute('data-slot', 'card-description');
    });

    it('should render with text content', () => {
      render(<CardDescription data-testid="card-description">Card Description</CardDescription>);
      expect(screen.getByText('Card Description')).toBeInTheDocument();
    });

    it('should have text-sm class', () => {
      render(<CardDescription data-testid="card-description">Description</CardDescription>);
      expect(screen.getByTestId('card-description')).toHaveClass('text-sm');
    });

    it('should have text-muted-foreground class', () => {
      render(<CardDescription data-testid="card-description">Description</CardDescription>);
      expect(screen.getByTestId('card-description')).toHaveClass('text-muted-foreground');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      render(<CardDescription className="custom-description" data-testid="card-description">Desc</CardDescription>);
      expect(screen.getByTestId('card-description')).toHaveClass('custom-description');
    });
  });
});

describe('CardAction', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(<CardAction data-testid="card-action">Action</CardAction>);
      expect(screen.getByTestId('card-action')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<CardAction data-testid="card-action">Action</CardAction>);
      expect(screen.getByTestId('card-action')).toHaveAttribute('data-slot', 'card-action');
    });

    it('should render children', () => {
      render(<CardAction data-testid="card-action"><button>Edit</button></CardAction>);
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      render(<CardAction className="custom-action" data-testid="card-action">Action</CardAction>);
      expect(screen.getByTestId('card-action')).toHaveClass('custom-action');
    });
  });
});

describe('CardContent', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>);
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>);
      expect(screen.getByTestId('card-content')).toHaveAttribute('data-slot', 'card-content');
    });

    it('should render children', () => {
      render(<CardContent data-testid="card-content"><p>Card Content</p></CardContent>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should have px-6 class', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>);
      expect(screen.getByTestId('card-content')).toHaveClass('px-6');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      render(<CardContent className="custom-content" data-testid="card-content">Content</CardContent>);
      expect(screen.getByTestId('card-content')).toHaveClass('custom-content');
    });
  });
});

describe('CardFooter', () => {
  describe('when rendered', () => {
    it('should render without crashing', () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
      expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
      expect(screen.getByTestId('card-footer')).toHaveAttribute('data-slot', 'card-footer');
    });

    it('should render children', () => {
      render(<CardFooter data-testid="card-footer"><button>Action</button></CardFooter>);
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should have flex class', () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
      expect(screen.getByTestId('card-footer')).toHaveClass('flex');
    });

    it('should have items-center class', () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
      expect(screen.getByTestId('card-footer')).toHaveClass('items-center');
    });

    it('should have px-6 class', () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
      expect(screen.getByTestId('card-footer')).toHaveClass('px-6');
    });
  });

  describe('when custom className is provided', () => {
    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="card-footer">Footer</CardFooter>);
      expect(screen.getByTestId('card-footer')).toHaveClass('custom-footer');
    });
  });
});

describe('Card integration', () => {
  it('should render complete Card structure', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Card Title</CardTitle>
          <CardDescription data-testid="card-description">Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="card-content">
          <p>Card content goes here</p>
        </CardContent>
        <CardFooter data-testid="card-footer">
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toBeInTheDocument();
    expect(screen.getByTestId('card-description')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('card-footer')).toBeInTheDocument();
  });
});
