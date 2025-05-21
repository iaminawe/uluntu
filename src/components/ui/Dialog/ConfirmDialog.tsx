import React from 'react';
import { ConfirmDialogProps } from './types';

/**
 * Reusable confirmation dialog component
 * Used for confirming potentially destructive actions like delete
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isOpen,
  isProcessing = false,
  onConfirm,
  onCancel,
  confirmButtonClassName = '',
  cancelButtonClassName = '',
  type = 'danger',
}) => {
  if (!isOpen) return null;
  
  // Adjust colors based on type
  const getConfirmButtonClass = () => {
    if (confirmButtonClassName) return confirmButtonClassName;
    
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-orange-500 hover:bg-orange-600 text-white';
    }
  };
  
  const getCancelButtonClass = () => {
    if (cancelButtonClassName) return cancelButtonClassName;
    return 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700';
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="text-slate-700 dark:text-slate-300 mb-6">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-md ${getCancelButtonClass()}`}
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md ${getConfirmButtonClass()}
                      ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isProcessing}
          >
            {isProcessing ? `${confirmText}ing...` : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
