import React, { Component, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface Props {
  featureName: string;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: ReactNode;
  resetKeys?: Array<string | number>;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetCount: number;
}

/**
 * FeatureErrorBoundary - Reusable error boundary for wrapping critical features
 *
 * Features:
 * - Catches and logs errors with context
 * - Provides user-friendly fallback UI
 * - Supports error recovery/retry functionality
 * - Includes context about what failed
 * - Auto-resets on prop changes
 *
 * Usage:
 * <FeatureErrorBoundary
 *   featureName="Menu Management"
 *   onError={(error, info) => console.log(error)}
 *   fallback={<CustomErrorUI />}
 * >
 *   <YourComponent />
 * </FeatureErrorBoundary>
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      resetCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with context
    logger.error(
      `Error in ${this.props.featureName}`,
      'FEATURE_ERROR_BOUNDARY',
      {
        featureName: this.props.featureName,
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
        resetCount: this.state.resetCount,
      }
    );

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const keysChanged = !prevProps.resetKeys ||
        prevProps.resetKeys.some((key, index) => key !== this.props.resetKeys?.[index]);

      if (keysChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      resetCount: prevState.resetCount + 1,
    }));

    // Call optional reset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <ErrorFallbackUI
          featureName={this.props.featureName}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Generic Error Fallback UI Component
 */
interface ErrorFallbackUIProps {
  featureName: string;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onRetry: () => void;
}

const ErrorFallbackUI: React.FC<ErrorFallbackUIProps> = ({
  featureName,
  error,
  errorInfo,
  onRetry,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 border-l-4 border-red-500">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-4xl">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Error in {featureName}
            </h1>
          </div>
          <p className="text-gray-600">
            We encountered an unexpected error while using this feature. Please try the options below.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-mono text-red-700 break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Error Details (Dev Only) */}
        {import.meta.env.DEV && errorInfo && (
          <details className="mb-6 cursor-pointer">
            <summary className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Technical Details (Development Only)
            </summary>
            <div className="mt-3 p-3 bg-gray-100 rounded-lg overflow-auto max-h-64">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                {errorInfo.componentStack}
              </pre>
              {error?.stack && (
                <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words mt-2">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Reload Page
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
          <p className="font-medium text-blue-900 mb-2">What you can do:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-900">
            <li>Try refreshing the page</li>
            <li>Check your internet connection</li>
            <li>Clear your browser cache</li>
            <li>Contact support if the problem persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export { ErrorFallbackUI };
