import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormHeaderProps } from './types';

/**
 * Reusable form header component with back navigation
 * Used across edit pages for consistent header styling
 */
const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  subtitle,
  backUrl,
  backText = 'Back',
  actions,
  className = '',
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to={backUrl}
            className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backText}
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3 items-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormHeader;
