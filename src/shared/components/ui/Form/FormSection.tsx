import React from 'react';
import { FormSectionProps } from '@/shared/components/ui/Form/types';

/**
 * Reusable form section component
 * Used to divide forms into logical sections with optional titles and descriptions
 */
const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  highlighted = false,
  children,
  className = '',
}) => {
  // Base classes for the section
  const sectionClasses = `p-6 rounded-lg ${className}`;
  
  // Add background styling if highlighted
  const backgroundClasses = highlighted 
    ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700' 
    : '';

  return (
    <div className={`${sectionClasses} ${backgroundClasses}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
