/**
 * ErrorAlert Component
 * 
 * Displays sanitized error messages with consistent styling and optional retry functionality
 */

import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { SanitizedError, getErrorTitle } from '@/utils/errorSanitization';

interface ErrorAlertProps {
  error: SanitizedError;
  onRetry?: () => void;
  onDismiss?: () => void;
  canRetry?: boolean;
  isRetrying?: boolean;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
  showErrorCode?: boolean;
}

export function ErrorAlert({
  error,
  onRetry,
  onDismiss,
  canRetry = false,
  isRetrying = false,
  variant = 'error',
  className = '',
  showErrorCode = false
}: ErrorAlertProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500',
          icon: 'text-yellow-500',
          text: 'text-yellow-700 dark:text-yellow-400',
          button: 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-200'
        };
      case 'info':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500',
          icon: 'text-blue-500',
          text: 'text-blue-700 dark:text-blue-400',
          button: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200'
        };
      default: // error
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500',
          icon: 'text-red-500',
          text: 'text-red-700 dark:text-red-400',
          button: 'bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.text}`}>
            {getErrorTitle(error.errorCode)}
          </h3>
          <div className={`mt-1 text-sm ${styles.text}`}>
            <p>{error.userMessage}</p>
            {showErrorCode && (
              <p className="mt-1 text-xs opacity-75">
                Error Code: {error.errorCode} | ID: {error.debugId.slice(0, 8)}
              </p>
            )}
          </div>
          
          {(canRetry || onDismiss) && (
            <div className="mt-4 flex space-x-2">
              {canRetry && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </>
                  )}
                </button>
              )}
              
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                  <X className="h-4 w-4 mr-2" />
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Simplified error alert for inline use
 */
interface InlineErrorProps {
  error: SanitizedError | null;
  className?: string;
}

export function InlineError({ error, className = '' }: InlineErrorProps) {
  if (!error) return null;

  return (
    <div className={`flex items-center mt-1 text-sm text-red-600 dark:text-red-400 ${className}`}>
      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
      <span>{error.userMessage}</span>
    </div>
  );
}

/**
 * Form field error component
 */
interface FieldErrorProps {
  error: SanitizedError | null;
  fieldName?: string;
  className?: string;
}

export function FieldError({ error, fieldName, className = '' }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div className={`mt-1 text-sm text-red-600 dark:text-red-400 ${className}`}>
      {error.userMessage}
    </div>
  );
}

/**
 * Toast-style error notification
 */
interface ErrorToastProps {
  error: SanitizedError;
  onClose: () => void;
  duration?: number;
}

export function ErrorToast({ error, onClose, duration = 5000 }: ErrorToastProps) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium">{getErrorTitle(error.errorCode)}</h4>
            <p className="mt-1 text-sm opacity-90">{error.userMessage}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-white hover:text-gray-200 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}