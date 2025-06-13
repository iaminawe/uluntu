/**
 * Type definitions for Error Display components
 */

export interface ErrorDisplayProps {
  /**
   * Error title to display
   */
  title?: string;
  /**
   * Error message or description
   */
  message?: string;
  /**
   * Link to navigate back or to another page
   */
  backLink?: {
    /**
     * URL to navigate to
     */
    to: string;
    /**
     * Text for the link
     */
    text: string;
  };
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
  /**
   * Optional icon to display with the error
   */
  icon?: React.ReactNode;
  /**
   * Optional action button(s) to display
   */
  actions?: React.ReactNode;
  /**
   * Optional primary action
   */
  primaryAction?: {
    /**
     * Action to perform when clicked
     */
    onClick: () => void;
    /**
     * Text for the button
     */
    text: string;
  };
}

export interface NotFoundErrorProps extends Omit<ErrorDisplayProps, 'title' | 'message'> {
  /**
   * Type of resource that was not found
   */
  resourceType?: string;
  /**
   * Custom message to override default not found message
   */
  message?: string;
}

export interface ServerErrorProps extends Omit<ErrorDisplayProps, 'title' | 'message'> {
  /**
   * Error object if available
   */
  error?: Error | unknown;
  /**
   * Custom message to override default server error message
   */
  message?: string;
}

export interface QueryErrorProps extends Omit<ErrorDisplayProps, 'title' | 'message'> {
  /**
   * Error object from query
   */
  error?: Error | unknown;
  /**
   * Function to retry the query
   */
  retry?: () => void;
  /**
   * Custom message to override default query error message
   */
  message?: string;
}
