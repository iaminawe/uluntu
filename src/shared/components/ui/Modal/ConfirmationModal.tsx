import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import Modal from '@/shared/components/ui/Modal/Modal';
import { ConfirmationModalProps } from '@/shared/components/ui/Modal/types';

/**
 * Confirmation modal component
 * Used for asking users to confirm actions before proceeding
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  icon,
  isProcessing = false,
  className = '',
}) => {
  // Determine icon and colors based on the type
  const getTypeIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-10 w-10 text-amber-500 dark:text-amber-400" />;
      case 'danger':
        return <AlertCircle className="h-10 w-10 text-red-500 dark:text-red-400" />;
      case 'info':
      default:
        return <Info className="h-10 w-10 text-blue-500 dark:text-blue-400" />;
    }
  };

  // Determine button colors based on the type
  const getButtonColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600';
      case 'info':
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  // Render footer with action buttons
  const renderFooter = () => (
    <div className="flex flex-row-reverse justify-start space-x-2 space-x-reverse">
      <button
        type="button"
        onClick={onConfirm}
        disabled={isProcessing}
        className={`px-4 py-2 ${getButtonColor()} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-3 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? 'Processing...' : confirmText}
      </button>
      <button
        type="button"
        onClick={onClose}
        disabled={isProcessing}
        className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={renderFooter()}
      size="sm"
      className={className}
      closeOnOutsideClick={!isProcessing}
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="mb-4">
          {getTypeIcon()}
        </div>
        <div className="mb-6">
          {typeof message === 'string' ? (
            <p className="text-slate-600 dark:text-slate-300">{message}</p>
          ) : (
            message
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
