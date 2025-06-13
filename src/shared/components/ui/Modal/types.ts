/**
 * Type definitions for Modal components
 */
import { ReactNode } from 'react';

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Handler for closing the modal
   */
  onClose: () => void;
  /**
   * Modal title
   */
  title?: string;
  /**
   * Modal content
   */
  children: ReactNode;
  /**
   * Modal size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Whether to show a close button
   */
  showCloseButton?: boolean;
  /**
   * Additional actions to display in the header
   */
  headerActions?: ReactNode;
  /**
   * Footer content
   */
  footer?: ReactNode;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
  /**
   * Additional classes for the overlay
   */
  overlayClassName?: string;
  /**
   * Whether to close the modal when clicking outside
   */
  closeOnOutsideClick?: boolean;
  /**
   * Whether the modal is centered vertically
   */
  centered?: boolean;
}

export interface ConfirmationModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Handler for closing the modal
   */
  onClose: () => void;
  /**
   * Title of the confirmation modal
   */
  title: string;
  /**
   * Confirmation message
   */
  message: string | ReactNode;
  /**
   * Handler for confirming the action
   */
  onConfirm: () => void;
  /**
   * Text for the confirm button
   */
  confirmText?: string;
  /**
   * Text for the cancel button
   */
  cancelText?: string;
  /**
   * Type of confirmation
   */
  type?: 'info' | 'warning' | 'danger';
  /**
   * Optional icon to display
   */
  icon?: ReactNode;
  /**
   * Whether the confirmation action is processing
   */
  isProcessing?: boolean;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}

export interface FormModalProps extends Omit<ModalProps, 'children'> {
  /**
   * Form content
   */
  children: ReactNode;
  /**
   * Handler for form submission
   */
  onSubmit: (data: any) => void;
  /**
   * Text for the submit button
   */
  submitText?: string;
  /**
   * Text for the cancel button
   */
  cancelText?: string;
  /**
   * Whether the form is submitting
   */
  isSubmitting?: boolean;
  /**
   * Whether to show a loading indicator
   */
  showLoadingIndicator?: boolean;
}

export interface SlideoverPanelProps {
  /**
   * Whether the panel is open
   */
  isOpen: boolean;
  /**
   * Handler for closing the panel
   */
  onClose: () => void;
  /**
   * Panel title
   */
  title?: string;
  /**
   * Panel content
   */
  children: ReactNode;
  /**
   * Panel side
   */
  side?: 'right' | 'left';
  /**
   * Panel width
   */
  width?: 'narrow' | 'default' | 'wide';
  /**
   * Additional actions to display in the header
   */
  headerActions?: ReactNode;
  /**
   * Footer content
   */
  footer?: ReactNode;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}
