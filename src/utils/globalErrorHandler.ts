import { logger } from './logger';

// Global error handler for uncaught errors
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', 'GLOBAL_ERROR', {
      reason: event.reason,
      promise: event.promise,
    });

    // Prevent the default behavior in production
    if (import.meta.env.PROD) {
      event.preventDefault();
    }
  });

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    logger.error('Global error', 'GLOBAL_ERROR', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });

    // Check for specific error patterns
    if (event.message.includes('Failed to fetch dynamically imported module')) {
      // This often happens when deploying new versions
      logger.warn('Module loading error detected, might need page refresh', 'GLOBAL_ERROR');
      
      // Show user-friendly message
      if (import.meta.env.PROD) {
        const shouldReload = window.confirm(
          'A new version of the application is available. Would you like to refresh the page?'
        );
        if (shouldReload) {
          window.location.reload();
        }
      }
    }
  });

  // Log when the app starts
  logger.info('Application started', 'APP_LIFECYCLE', {
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  });
}

// Check for common runtime issues
export function checkRuntimeEnvironment() {
  const issues: string[] = [];

  // Check for required environment variables
  // SECURITY: read statically — dynamic access (import.meta.env[varName]) makes
  // Vite inline the entire env object into the client bundle.
  const requiredEnvVars: Record<string, string | undefined> = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  Object.entries(requiredEnvVars).forEach(([varName, value]) => {
    if (!value) {
      issues.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Check for localStorage availability
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
  } catch (e) {
    issues.push('localStorage is not available');
  }

  // Check for IndexedDB availability
  if (!window.indexedDB) {
    issues.push('IndexedDB is not available');
  }

  // Log any issues found
  if (issues.length > 0) {
    logger.error('Runtime environment issues detected', 'ENV_CHECK', { issues });
  } else {
    logger.info('Runtime environment check passed', 'ENV_CHECK');
  }

  return issues;
}