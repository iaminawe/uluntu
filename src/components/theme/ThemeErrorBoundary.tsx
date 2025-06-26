import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  showDetails: boolean;
}

/**
 * Error boundary specifically for theme-related components
 * Provides graceful error handling and recovery options
 */
export class ThemeErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Theme Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    onError?.(error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Show error toast
    toast.error('Theme system encountered an error', {
      duration: 5000,
      icon: '🎨',
    });

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  override componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset on props change if enabled
    if (hasError && prevProps.children !== this.props.children && resetOnPropsChange) {
      this.resetErrorBoundary();
    }

    // Reset when resetKeys change
    if (resetKeys && this.previousResetKeys.join(',') !== resetKeys.join(',')) {
      this.previousResetKeys = resetKeys;
      if (hasError) {
        this.resetErrorBoundary();
      }
    }
  }

  override componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, this would send to Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      themeContext: 'theme-system',
    };

    // Placeholder for error reporting service
    console.error('Error logged to service:', errorData);
  };

  handleReset = () => {
    // Prevent rapid resets
    if (this.resetTimeoutId) return;

    this.resetErrorBoundary();
    toast.success('Theme system reset successfully');

    // Prevent reset spam
    this.resetTimeoutId = setTimeout(() => {
      this.resetTimeoutId = null;
    }, 2000);
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  override render() {
    const { hasError, error, errorInfo, errorCount, showDetails } = this.state;
    const { children, fallback, isolate } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI
      return (
        <div className={`${isolate ? 'relative' : 'min-h-[400px] flex items-center justify-center'} p-4`}>
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              {/* Error Header */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-red-900">
                    Theme System Error
                  </h3>
                  <p className="mt-2 text-sm text-red-700">
                    {error.message || 'An unexpected error occurred in the theme system'}
                  </p>
                  
                  {/* Error count warning */}
                  {errorCount > 2 && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      This error has occurred {errorCount} times. Consider refreshing the page.
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={this.handleReset}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Try Again
                    </button>
                    
                    <button
                      onClick={this.toggleDetails}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Bug className="h-4 w-4 mr-1" />
                      {showDetails ? 'Hide' : 'Show'} Details
                      {showDetails ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Refresh Page
                    </button>
                  </div>

                  {/* Error details */}
                  {showDetails && errorInfo && (
                    <div className="mt-4 bg-red-100 rounded-md p-3">
                      <h4 className="text-sm font-medium text-red-900 mb-2">
                        Error Details
                      </h4>
                      <pre className="text-xs text-red-800 overflow-x-auto whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                      {process.env.NODE_ENV === 'development' && (
                        <>
                          <h4 className="text-sm font-medium text-red-900 mt-3 mb-2">
                            Component Stack
                          </h4>
                          <pre className="text-xs text-red-800 overflow-x-auto whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Help text */}
            <p className="mt-4 text-sm text-gray-600 text-center">
              If this problem persists, please contact support or try using a different theme.
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook to use error boundary imperatively
 */
export function useThemeErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const throwError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  return { throwError, resetError };
}