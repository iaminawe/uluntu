import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Palette, Sparkles, Brush, RefreshCw } from 'lucide-react';

interface ThemeLoadingProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'shimmer' | 'progress';
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * Animated loading spinner for theme operations
 */
export const ThemeLoadingSpinner: React.FC<ThemeLoadingProps> = ({
  message = 'Loading theme...',
  size = 'md',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center p-8"
    >
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Palette className={`${sizeClasses[size]} text-blue-400 opacity-30`} />
        </motion.div>
      </div>
      {message && (
        <p className={`mt-3 ${textSizes[size]} text-gray-600 text-center`}>
          {message}
        </p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Skeleton loader for theme cards
 */
export const ThemeCardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
          </div>

          {/* Color swatches */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            ))}
          </div>

          {/* Preview section */}
          <div className="mt-4 h-48 bg-gray-100 rounded-lg"></div>
        </div>
      ))}
    </>
  );
};

/**
 * Shimmer effect for loading states
 */
export const ThemeShimmer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
    </div>
  );
};

/**
 * Progress bar for theme operations
 */
export const ThemeProgressBar: React.FC<{
  progress: number;
  message?: string;
  showPercentage?: boolean;
}> = ({ progress, message, showPercentage = true }) => {
  return (
    <div className="w-full">
      {message && (
        <p className="text-sm text-gray-600 mb-2">{message}</p>
      )}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <ThemeShimmer className="opacity-30" />
        </motion.div>
      </div>
      {showPercentage && (
        <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(progress)}%</p>
      )}
    </div>
  );
};

/**
 * Animated theme transition loader
 */
export const ThemeTransitionLoader: React.FC<{
  isLoading: boolean;
  fromTheme?: string;
  toTheme?: string;
}> = ({ isLoading, fromTheme = 'Current theme', toTheme = 'New theme' }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4"
          >
            <div className="text-center">
              {/* Animated icon */}
              <div className="relative h-16 w-16 mx-auto mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0"
                >
                  <Brush className="h-16 w-16 text-blue-600" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Sparkles className="h-8 w-8 text-yellow-500" />
                </motion.div>
              </div>

              {/* Text */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Applying Theme
              </h3>
              <p className="text-sm text-gray-600">
                Transitioning from <span className="font-medium">{fromTheme}</span> to{' '}
                <span className="font-medium">{toTheme}</span>
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-1 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 bg-blue-600 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Loading state for theme manager
 */
export const ThemeManagerLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 border border-gray-200 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="flex gap-2">
                      <div className="h-10 w-16 bg-gray-200 rounded"></div>
                      <div className="h-10 flex-1 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Error retry loading state
 */
export const ThemeRetryLoading: React.FC<{
  onRetry: () => void;
  message?: string;
}> = ({ onRetry, message = 'Failed to load theme' }) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await onRetry();
    setIsRetrying(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRetrying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </>
          )}
        </button>
      </div>
    </div>
  );
};