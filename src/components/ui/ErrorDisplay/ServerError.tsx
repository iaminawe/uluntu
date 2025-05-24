import React from 'react';
import { ServerCrash } from 'lucide-react';
import ErrorDisplay from './ErrorDisplay';
import { ServerErrorProps } from './types';

/**
 * Specialized error component for server/5xx errors
 */
const ServerError: React.FC<ServerErrorProps> = ({
  error: _error,
  message,
  backLink,
  className = '',
  actions,
  primaryAction,
}) => {
  const defaultMessage = message || 
    "We're experiencing some server issues. Please try again later or contact support if the problem persists.";

  return (
    <ErrorDisplay
      title="Server Error"
      message={defaultMessage}
      backLink={backLink}
      className={className}
      icon={<ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400" />}
      actions={actions}
      primaryAction={primaryAction || {
        text: 'Refresh Page',
        onClick: () => window.location.reload()
      }}
    />
  );
};

export default ServerError;
