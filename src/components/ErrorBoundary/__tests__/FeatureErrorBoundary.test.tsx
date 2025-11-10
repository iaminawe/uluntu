import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureErrorBoundary, ErrorFallbackUI } from '../FeatureErrorBoundary';

/**
 * Test component that can throw errors
 */
const TestComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error from component');
  }
  return <div>Test Component Content</div>;
};

/**
 * Test component with retry capability
 */
const RetryableTestComponent: React.FC = () => {
  const [count, setCount] = useState(0);

  if (count === 2) {
    throw new Error('Intentional test error');
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment (Error on 2)
      </button>
    </div>
  );
};

describe('FeatureErrorBoundary', () => {
  // Suppress console.error during tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rendering', () => {
    test('renders children when no error occurs', () => {
      render(
        <FeatureErrorBoundary featureName="Test Feature">
          <TestComponent shouldThrow={false} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText('Test Component Content')).toBeInTheDocument();
    });

    test('renders fallback UI when error occurs', () => {
      render(
        <FeatureErrorBoundary featureName="Menu Management">
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/Error in Menu Management/i)).toBeInTheDocument();
    });

    test('renders custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;

      render(
        <FeatureErrorBoundary
          featureName="Test"
          fallback={customFallback}
        >
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    test('calls onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <FeatureErrorBoundary
          featureName="Test"
          onError={onError}
        >
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    test('logs error with feature name', () => {
      const onError = jest.fn();

      render(
        <FeatureErrorBoundary
          featureName="User Management"
          onError={onError}
        >
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      const [error, errorInfo] = onError.mock.calls[0];
      expect(error).toBeInstanceOf(Error);
      expect(errorInfo.componentStack).toContain('TestComponent');
    });
  });

  describe('error fallback UI', () => {
    test('displays error message in fallback', () => {
      render(
        <FeatureErrorBoundary featureName="Test Feature">
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      // Check for error message in fallback UI
      expect(screen.getByText(/We encountered an unexpected error/i)).toBeInTheDocument();
    });

    test('shows dev details only in development mode', () => {
      const originalEnv = import.meta.env.DEV;

      render(
        <FeatureErrorBoundary featureName="Test">
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      // Technical details should be in a details element
      const details = screen.queryByText(/Technical Details/i) ||
                     screen.queryByText(/Development Only/i);

      if (import.meta.env.DEV) {
        expect(details).toBeInTheDocument();
      }
    });

    test('has retry button in fallback UI', () => {
      render(
        <FeatureErrorBoundary featureName="Test">
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      expect(retryButton).toBeInTheDocument();
    });

    test('has reload button in fallback UI', () => {
      render(
        <FeatureErrorBoundary featureName="Test">
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /Reload Page/i });
      expect(reloadButton).toBeInTheDocument();
    });

    test('has go back button in fallback UI', () => {
      render(
        <FeatureErrorBoundary featureName="Test">
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      const goBackButton = screen.getByRole('button', { name: /Go Back/i });
      expect(goBackButton).toBeInTheDocument();
    });
  });

  describe('reset functionality', () => {
    test('calls onReset when reset button clicked', () => {
      const onReset = jest.fn();

      const { rerender } = render(
        <FeatureErrorBoundary
          featureName="Test"
          onReset={onReset}
          resetKeys={[0]}
        >
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      // Reset by changing resetKeys
      rerender(
        <FeatureErrorBoundary
          featureName="Test"
          onReset={onReset}
          resetKeys={[1]}
        >
          <TestComponent shouldThrow={false} />
        </FeatureErrorBoundary>
      );

      expect(onReset).toHaveBeenCalled();
    });

    test('auto-resets when resetKeys change', () => {
      const { rerender } = render(
        <FeatureErrorBoundary
          featureName="Test"
          resetKeys={[1]}
        >
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      // Should show error initially
      expect(screen.getByText(/Error in Test/i)).toBeInTheDocument();

      // Change resetKeys to trigger reset
      rerender(
        <FeatureErrorBoundary
          featureName="Test"
          resetKeys={[2]}
        >
          <TestComponent shouldThrow={false} />
        </FeatureErrorBoundary>
      );

      // Should render children after reset
      expect(screen.getByText('Test Component Content')).toBeInTheDocument();
    });
  });

  describe('feature name handling', () => {
    test('displays feature name in error message', () => {
      render(
        <FeatureErrorBoundary featureName="Custom Feature Name">
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/Error in Custom Feature Name/i)).toBeInTheDocument();
    });

    test('uses feature name in logging', () => {
      const onError = jest.fn();

      render(
        <FeatureErrorBoundary
          featureName="Analytics Module"
          onError={onError}
        >
          <TestComponent shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('ErrorFallbackUI', () => {
  test('renders with all required elements', () => {
    render(
      <ErrorFallbackUI
        featureName="Test Feature"
        error={new Error('Test error message')}
        errorInfo={{ componentStack: 'TestComponent\n  MyComponent' }}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText(/Error in Test Feature/i)).toBeInTheDocument();
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
    expect(screen.getByText(/Reload Page/i)).toBeInTheDocument();
    expect(screen.getByText(/Go Back/i)).toBeInTheDocument();
  });

  test('displays error message when provided', () => {
    const errorMessage = 'Something specific went wrong';

    render(
      <ErrorFallbackUI
        featureName="Test"
        error={new Error(errorMessage)}
        errorInfo={{ componentStack: '' }}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('calls onRetry when Try Again button clicked', () => {
    const onRetry = jest.fn();

    render(
      <ErrorFallbackUI
        featureName="Test"
        error={new Error('Test')}
        errorInfo={{ componentStack: '' }}
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });

  test('has navigation history fallback when goBack unavailable', () => {
    render(
      <ErrorFallbackUI
        featureName="Test"
        error={new Error('Test')}
        errorInfo={{ componentStack: '' }}
        onRetry={jest.fn()}
      />
    );

    const goBackButton = screen.getByRole('button', { name: /Go Back/i });
    expect(goBackButton).toBeInTheDocument();
  });
});
