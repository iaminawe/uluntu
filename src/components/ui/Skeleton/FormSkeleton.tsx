import React from 'react';
import { SkeletonProps } from './types';

export interface FormSkeletonProps extends SkeletonProps {
  /**
   * Number of form fields to show
   */
  fields?: number;
  /**
   * Whether to include a submit button
   */
  hasSubmitButton?: boolean;
  /**
   * Whether to include a cancel button
   */
  hasCancelButton?: boolean;
  /**
   * Whether to include a form header
   */
  hasHeader?: boolean;
}

/**
 * Skeleton component for forms during loading states
 */
const FormSkeleton: React.FC<FormSkeletonProps> = ({
  className = '',
  fields = 3,
  hasSubmitButton = true,
  hasCancelButton = true,
  hasHeader = true,
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Form Header Skeleton */}
      {hasHeader && (
        <div className="mb-8">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      )}
      
      {/* Form Fields Skeleton */}
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            {index === fields - 1 && fields > 2 ? (
              // Make the last field a textarea if there are more than 2 fields
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            ) : (
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Form Actions Skeleton */}
      {(hasSubmitButton || hasCancelButton) && (
        <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          {hasCancelButton && (
            <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          )}
          {hasSubmitButton && (
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormSkeleton;
