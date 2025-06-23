/**
 * Custom Hook for Error Handling
 * 
 * This hook provides a consistent way to handle and display errors
 * throughout the application with proper sanitization.
 */

import { useState, useCallback } from 'react';
import { sanitizeError, logAndSanitizeError, SanitizedError, isRetryableError } from '@/utils/errorSanitization';

interface UseErrorHandlingOptions {
  context?: string;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface ErrorState {
  error: SanitizedError | null;
  isRetrying: boolean;
  retryCount: number;
}

export function useErrorHandling(options: UseErrorHandlingOptions = {}) {
  const {
    context = 'Unknown',
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 1000
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0
  });

  /**
   * Handle an error with sanitization and optional retry logic
   */
  const handleError = useCallback(async (
    error: unknown,
    retryFunction?: () => Promise<void>
  ) => {
    const sanitized = logAndSanitizeError(error, context);
    
    // Check if this error should be retried
    if (autoRetry && retryFunction && isRetryableError(sanitized) && errorState.retryCount < maxRetries) {
      setErrorState(prev => ({
        error: sanitized,
        isRetrying: true,
        retryCount: prev.retryCount + 1
      }));

      try {
        // Wait before retrying with exponential backoff
        const delay = retryDelay * Math.pow(2, errorState.retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        await retryFunction();
        
        // Success - clear error
        setErrorState({
          error: null,
          isRetrying: false,
          retryCount: 0
        });
      } catch (retryError) {
        // Retry failed - handle the new error
        const retriedSanitized = logAndSanitizeError(retryError, `${context} (retry ${errorState.retryCount})`);
        setErrorState(prev => ({
          error: retriedSanitized,
          isRetrying: false,
          retryCount: prev.retryCount
        }));
      }
    } else {
      // No retry or max retries reached
      setErrorState({
        error: sanitized,
        isRetrying: false,
        retryCount: 0
      });
    }
  }, [context, autoRetry, maxRetries, retryDelay, errorState.retryCount]);

  /**
   * Manually retry the last failed operation
   */
  const retry = useCallback(async (retryFunction: () => Promise<void>) => {
    if (!errorState.error || errorState.isRetrying) return;

    setErrorState(prev => ({
      ...prev,
      isRetrying: true
    }));

    try {
      await retryFunction();
      setErrorState({
        error: null,
        isRetrying: false,
        retryCount: 0
      });
    } catch (error) {
      const sanitized = logAndSanitizeError(error, `${context} (manual retry)`);
      setErrorState({
        error: sanitized,
        isRetrying: false,
        retryCount: 0
      });
    }
  }, [context, errorState.error, errorState.isRetrying]);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0
    });
  }, []);

  /**
   * Set an error without going through sanitization (for pre-sanitized errors)
   */
  const setError = useCallback((error: SanitizedError) => {
    setErrorState({
      error,
      isRetrying: false,
      retryCount: 0
    });
  }, []);

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    hasError: errorState.error !== null,
    canRetry: errorState.error ? isRetryableError(errorState.error) : false,
    handleError,
    retry,
    clearError,
    setError
  };
}

/**
 * Simplified hook for basic error handling without retry logic
 */
export function useSimpleError(context?: string) {
  const [error, setError] = useState<SanitizedError | null>(null);

  const handleError = useCallback((err: unknown) => {
    const sanitized = logAndSanitizeError(err, context);
    setError(sanitized);
  }, [context]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    hasError: error !== null,
    handleError,
    clearError,
    setError
  };
}

/**
 * Hook for handling form validation errors
 */
export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, SanitizedError>>({});

  const setFieldError = useCallback((field: string, error: unknown) => {
    const sanitized = sanitizeError(error);
    setErrors(prev => ({
      ...prev,
      [field]: sanitized
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasError = useCallback((field?: string) => {
    if (field) {
      return field in errors;
    }
    return Object.keys(errors).length > 0;
  }, [errors]);

  const getError = useCallback((field: string) => {
    return errors[field] || null;
  }, [errors]);

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasError,
    getError,
    hasAnyError: Object.keys(errors).length > 0
  };
}