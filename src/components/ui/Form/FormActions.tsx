import React from 'react';
import { Trash2 } from 'lucide-react';
import { FormActionsProps } from './types';

/**
 * Reusable form actions component
 * Provides standardized submit, cancel, and delete buttons for forms
 */
const FormActions: React.FC<FormActionsProps> = ({
  onSubmit,
  onCancel,
  onDelete,
  submitText = 'Save',
  cancelText = 'Cancel',
  deleteText = 'Delete',
  isSubmitting = false,
  isNew = false,
  className = '',
  align = 'between',
}) => {
  // Determine alignment class
  const alignmentClass = {
    'left': 'justify-start',
    'center': 'justify-center',
    'right': 'justify-end',
    'between': 'justify-between',
  }[align];

  return (
    <div className={`flex flex-wrap items-center gap-4 mt-8 ${alignmentClass} ${className}`}>
      {/* Delete button - only shown for existing entities */}
      {!isNew && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 
                    text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 rounded-md 
                    hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 
                    focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-5 w-5 mr-2" />
          {deleteText}
        </button>
      )}
      
      <div className="flex items-center gap-4 ml-auto">
        {/* Cancel button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 
                     text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-md 
                     hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 
                     focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        )}
        
        {/* Submit button */}
        {onSubmit && (
          <button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : submitText}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormActions;
