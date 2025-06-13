import React from 'react';
import { FileSearch } from 'lucide-react';
import ErrorDisplay from '@/shared/components/ui/ErrorDisplay/ErrorDisplay';
import { NotFoundErrorProps } from '@/shared/components/ui/ErrorDisplay/types';

/**
 * Specialized error component for 404/Not Found errors
 */
const NotFoundError: React.FC<NotFoundErrorProps> = ({
  resourceType = 'resource',
  message,
  backLink,
  className = '',
  actions,
  primaryAction,
}) => {
  const defaultMessage = message || 
    `We couldn't find the ${resourceType} you're looking for. It may have been removed or the URL might be incorrect.`;

  return (
    <ErrorDisplay
      title={`${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Not Found`}
      message={defaultMessage}
      backLink={backLink}
      className={className}
      icon={<FileSearch className="h-12 w-12 text-slate-400 dark:text-slate-500" />}
      actions={actions}
      primaryAction={primaryAction}
    />
  );
};

export default NotFoundError;
