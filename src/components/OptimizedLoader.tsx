import React from 'react';

interface OptimizedLoaderProps {
  message?: string;
  minimal?: boolean;
}

export const OptimizedLoader: React.FC<OptimizedLoaderProps> = ({ 
  message = "Loading...", 
  minimal = false 
}) => {
  if (minimal) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-pulse flex space-x-4 w-full max-w-4xl">
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-[200px] bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mb-3"></div>
      <p className="text-slate-600 dark:text-slate-300 text-sm">{message}</p>
    </div>
  );
};

export default OptimizedLoader;