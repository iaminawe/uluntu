import React from 'react';
import { Loader } from 'lucide-react';
import Modal from './Modal';
import { FormModalProps } from './types';

/**
 * Form modal component
 * Used for displaying forms in a modal with consistent styling and behavior
 */
const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isSubmitting = false,
  showLoadingIndicator = true,
  children,
  ...modalProps
}) => {
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a FormData object from the form
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Convert FormData to an object
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    
    // Call the onSubmit handler with the form data
    onSubmit(data);
  };

  // Render footer with form actions
  const renderFooter = () => (
    <div className="flex flex-row-reverse justify-start space-x-2 space-x-reverse">
      <button
        type="submit"
        form="form-modal"
        disabled={isSubmitting}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md 
                 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 
                 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
      >
        {isSubmitting && showLoadingIndicator && (
          <Loader className="h-4 w-4 mr-2 animate-spin" />
        )}
        {isSubmitting ? 'Submitting...' : submitText}
      </button>
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 
                 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 
                 disabled:opacity-50 disabled:cursor-not-allowed"
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
      closeOnOutsideClick={!isSubmitting}
      {...modalProps}
    >
      <form id="form-modal" onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  );
};

export default FormModal;
