import React from 'react';
import { WifiOff } from 'lucide-react';
import ErrorDisplay from '@/shared/components/ui/ErrorDisplay/ErrorDisplay';
import { QueryErrorProps } from '@/shared/components/ui/ErrorDisplay/types';

/**
 * Specialized error component for data fetching/query errors
 */
const QueryError: React.FC<QueryErrorProps> = ({
  error: _error,
  retry: onRetry,
  message,
  backLink,
  className = '',
  actions,
  primaryAction,
}) => {
  const defaultMessage = message || 
    "We couldn't load the data. This might be due to a network issue or the server might be unavailable.";

  return (
    <ErrorDisplay
      title="Failed to Load Data"
      message={defaultMessage}
      backLink={backLink}
      className={className}
      icon={<WifiOff className="h-12 w-12 text-amber-500 dark:text-amber-400" />}
      actions={actions}
      primaryAction={primaryAction || (onRetry ? {
        text: 'Try Again',
        onClick: onRetry
      } : undefined)}
    />
  );
};

export default QueryError;
