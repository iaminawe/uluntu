import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyStateProps } from '@/shared/components/ui/PageLayout/types';

/**
 * Reusable empty state component
 * Used to display a message when no content is available
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  primaryAction,
  primaryActionUrl,
  secondaryAction,
  secondaryActionUrl,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-slate-800 shadow-md rounded-lg p-8 text-center ${className}`}>
      {icon && (
        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {primaryActionUrl ? (
          <Link
            to={primaryActionUrl}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            {primaryAction?.text || 'Get Started'}
          </Link>
        ) : primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            {primaryAction.text}
          </button>
        )}
        
        {secondaryActionUrl ? (
          <Link
            to={secondaryActionUrl}
            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {secondaryAction?.text || 'Learn More'}
          </Link>
        ) : secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {secondaryAction.text}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
