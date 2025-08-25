import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  type?: 'warning' | 'info' | 'success' | 'error';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  showIcon?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  type = 'warning',
  onConfirm,
  onCancel,
  isLoading = false,
  showIcon = true
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconClass = "h-6 w-6";
    
    switch (type) {
      case 'warning':
        return <AlertTriangle className={cn(iconClass, "text-yellow-500")} />;
      case 'info':
        return <Info className={cn(iconClass, "text-blue-500")} />;
      case 'success':
        return <CheckCircle className={cn(iconClass, "text-green-500")} />;
      case 'error':
        return <XCircle className={cn(iconClass, "text-red-500")} />;
      default:
        return <AlertTriangle className={cn(iconClass, "text-yellow-500")} />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/20';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/20';
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onCancel();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      handleCancel();
    } else if (e.key === 'Enter' && !isLoading) {
      handleConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-message"
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {showIcon && (
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                getIconBgColor()
              )}>
                {getIcon()}
              </div>
            )}
            <div className="flex-1">
              <h3 
                id="confirmation-title"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
              >
                {title}
              </h3>
              <p 
                id="confirmation-message"
                className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap"
              >
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Convenience components for common dialog types
export const DeleteConfirmationDialog: React.FC<Omit<ConfirmationDialogProps, 'type' | 'confirmVariant' | 'confirmLabel'> & {
  itemName?: string;
  itemCount?: number;
}> = ({ itemName, itemCount, title, message, ...props }) => {
  const getTitle = () => {
    if (title) return title;
    if (itemCount && itemCount > 1) return `Delete ${itemCount} Items`;
    if (itemName) return `Delete ${itemName}`;
    return 'Delete Item';
  };

  const getMessage = () => {
    if (message) return message;
    if (itemCount && itemCount > 1) {
      return `Are you sure you want to delete these ${itemCount} items? This action cannot be undone.`;
    }
    if (itemName) {
      return `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
    }
    return 'Are you sure you want to delete this item? This action cannot be undone.';
  };

  return (
    <ConfirmationDialog
      {...props}
      title={getTitle()}
      message={getMessage()}
      type="warning"
      confirmVariant="destructive"
      confirmLabel="Delete"
    />
  );
};

export const SaveConfirmationDialog: React.FC<Omit<ConfirmationDialogProps, 'type' | 'confirmVariant' | 'confirmLabel'>> = (props) => (
  <ConfirmationDialog
    {...props}
    type="info"
    confirmVariant="default"
    confirmLabel="Save"
  />
);

export const DiscardConfirmationDialog: React.FC<Omit<ConfirmationDialogProps, 'type' | 'confirmVariant' | 'confirmLabel' | 'title' | 'message'>> = (props) => (
  <ConfirmationDialog
    {...props}
    title="Discard Changes"
    message="You have unsaved changes. Are you sure you want to discard them?"
    type="warning"
    confirmVariant="destructive"
    confirmLabel="Discard"
  />
);

export default ConfirmationDialog;