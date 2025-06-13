import { ReactNode } from 'react';

export interface ConfirmDialogProps {
  /**
   * Dialog title
   */
  title?: string;
  
  /**
   * Dialog message (can be string or ReactNode for complex content)
   */
  message: string | ReactNode;
  
  /**
   * Text for the confirm button
   */
  confirmText?: string;
  
  /**
   * Text for the cancel button
   */
  cancelText?: string;
  
  /**
   * Whether the dialog is visible
   */
  isOpen: boolean;
  
  /**
   * Whether an action is in progress (e.g., deleting)
   */
  isProcessing?: boolean;
  
  /**
   * Handler for confirm button click
   */
  onConfirm: () => void;
  
  /**
   * Handler for cancel button click
   */
  onCancel: () => void;
  
  /**
   * Custom class name for confirm button
   */
  confirmButtonClassName?: string;
  
  /**
   * Custom class name for cancel button
   */
  cancelButtonClassName?: string;
  
  /**
   * Type of dialog that sets the color scheme
   */
  type?: 'primary' | 'danger' | 'warning' | 'success';
}
