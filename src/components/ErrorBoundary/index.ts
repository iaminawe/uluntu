/**
 * Error Boundary Components
 *
 * Exports reusable error boundary components for graceful error handling
 */

// Export basic error boundary (legacy, used in main.tsx)
export { ErrorBoundary } from './BasicErrorBoundary';

// Export feature error boundaries
export { FeatureErrorBoundary, ErrorFallbackUI } from './FeatureErrorBoundary';
export {
  MenuErrorFallback,
  SettingsErrorFallback,
  UsersErrorFallback,
  NewsletterErrorFallback,
  GalleryErrorFallback,
  AdminErrorFallback,
} from './FeatureSpecificFallbacks';
