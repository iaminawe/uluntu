import React from 'react';
import { SettingsFieldProps } from '../types';

/**
 * Reusable field wrapper for form inputs
 */
export const SettingsField: React.FC<SettingsFieldProps> = ({
  label,
  required = false,
  description,
  error,
  children
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {description && !error && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};
