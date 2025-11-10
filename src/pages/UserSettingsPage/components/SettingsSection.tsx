import React from 'react';
import { SettingsSectionProps } from '../types';

/**
 * Reusable section wrapper for settings pages
 */
export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
