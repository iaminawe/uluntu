import React from 'react';
import { AlertCircle, Home, RefreshCw, MessageCircle } from 'lucide-react';

/**
 * Feature-Specific Error Fallback Components
 * Tailored error messages and actions for different features
 */

interface FallbackProps {
  error?: Error | null;
  onRetry?: () => void;
  onGoBack?: () => void;
}

/**
 * MenuErrorFallback - Error fallback for Menu Management
 */
export const MenuErrorFallback: React.FC<FallbackProps> = ({
  error,
  onRetry,
  onGoBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 border-l-4 border-red-500">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-500" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">Menu Management Error</h1>
        </div>

        <p className="text-gray-600 mb-6">
          We encountered an error while managing your menu. Your menu structure has been preserved.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center justify-center gap-2 w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Home size={18} />
              Go to Admin Dashboard
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Error ID: MENU_{Date.now()}
        </p>
      </div>
    </div>
  );
};

/**
 * SettingsErrorFallback - Error fallback for Settings Management
 */
export const SettingsErrorFallback: React.FC<FallbackProps> = ({
  error,
  onRetry,
  onGoBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 border-l-4 border-orange-500">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-orange-500" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">Settings Error</h1>
        </div>

        <p className="text-gray-600 mb-6">
          We couldn't load or save your settings. Your changes may not have been applied.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              Retry
            </button>
          )}
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center justify-center gap-2 w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Home size={18} />
              Go Back
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Your settings are safe and haven't been modified.
        </p>
      </div>
    </div>
  );
};

/**
 * UsersErrorFallback - Error fallback for User Management
 */
export const UsersErrorFallback: React.FC<FallbackProps> = ({
  error,
  onRetry,
  onGoBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-red-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 border-l-4 border-purple-500">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-purple-500" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">User Management Error</h1>
        </div>

        <p className="text-gray-600 mb-6">
          We encountered an error managing users. No user data has been modified.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              Retry
            </button>
          )}
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center justify-center gap-2 w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Home size={18} />
              Go to Admin
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          All user data remains unchanged and secure.
        </p>
      </div>
    </div>
  );
};

/**
 * NewsletterErrorFallback - Error fallback for Newsletter/Campaign Management
 */
export const NewsletterErrorFallback: React.FC<FallbackProps> = ({
  error,
  onRetry,
  onGoBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-red-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 border-l-4 border-blue-500">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-blue-500" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">Campaign Manager Error</h1>
        </div>

        <p className="text-gray-600 mb-6">
          We encountered an error managing your campaigns. Your draft campaigns have been saved.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center justify-center gap-2 w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Home size={18} />
              Back to Campaigns
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Your campaign data is safe and stored securely.
        </p>
      </div>
    </div>
  );
};

/**
 * GalleryErrorFallback - Error fallback for Gallery Management
 */
export const GalleryErrorFallback: React.FC<FallbackProps> = ({
  error,
  onRetry,
  onGoBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-red-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 border-l-4 border-green-500">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-green-500" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">Gallery Error</h1>
        </div>

        <p className="text-gray-600 mb-6">
          We encountered an error while managing your gallery. Your images and settings are safe.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              Retry
            </button>
          )}
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center justify-center gap-2 w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Home size={18} />
              Go Back
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          All your gallery content has been preserved.
        </p>
      </div>
    </div>
  );
};

/**
 * AdminErrorFallback - Generic error fallback for admin pages
 */
export const AdminErrorFallback: React.FC<FallbackProps> = ({
  error,
  onRetry,
  onGoBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 border-l-4 border-red-500">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-500" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">Admin Error</h1>
        </div>

        <p className="text-gray-600 mb-6">
          An error occurred in the administration panel. Your data is safe and changes have not been lost.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center justify-center gap-2 w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Home size={18} />
              Go to Dashboard
            </button>
          )}
          <button
            onClick={() => {
              const subject = encodeURIComponent('Admin Panel Error Report');
              const body = encodeURIComponent(`Error: ${error?.message || 'Unknown error'}`);
              window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
            }}
            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <MessageCircle size={18} />
            Report Issue
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Error ID: ADMIN_{Date.now()}
        </p>
      </div>
    </div>
  );
};
