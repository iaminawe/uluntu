import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { ErrorDisplayProps } from './types';

/**
 * General-purpose error display component
 * Can be configured for various error types and scenarios
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'An error occurred',
  message = 'Something went wrong. Please try again later.',
  backLink,
  className = '',
  icon,
  actions,
  primaryAction,
}) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center ${className}`}>
      <div className="mx-auto flex justify-center mb-6">
        {icon || <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400" />}
      </div>
      
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
        {title}
      </h2>
      
      <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-lg mx-auto">
        {message}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {backLink && (
          <Link
            to={backLink.to}
            className="inline-flex items-center text-orange-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLink.text}
          </Link>
        )}
        
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
          >
            {primaryAction.text}
          </button>
        )}
        
        {actions}
      </div>
    </div>
  );
};

export default ErrorDisplay;
