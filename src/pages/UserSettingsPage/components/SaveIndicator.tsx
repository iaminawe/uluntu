import React from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { SaveIndicatorProps } from '../types';

/**
 * Save status indicator component
 */
export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  isSaving,
  saveSuccess,
  error
}) => {
  if (!error && !saveSuccess) return null;

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <p className="text-sm text-green-700 dark:text-green-400">Settings saved successfully!</p>
          </div>
        </div>
      )}
    </>
  );
};
