import { useState } from 'react';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { FormActionsProps } from './types';
import { ConfirmationModal } from '@/shared/components/ui/Modal';

const FormActions: React.FC<FormActionsProps> = ({ 
  isEditMode, 
  isSubmitting, 
  navigate, 
  id,
  status = 'draft',
  onStatusChange
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleCancel = () => {
    navigate(isEditMode ? `/events/${id}` : '/events');
  };
  
  const handleDelete = () => {
    // In a real app, would make API call to delete the event
    console.log('Delete event with ID:', id);
    navigate('/events');
  };
  
  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mt-8 justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        {/* Delete button - only shown for existing entities */}
        {isEditMode && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 
                      text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 rounded-md 
                      hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 
                      focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Delete
          </button>
        )}
        
        <div className="flex items-center gap-4 ml-auto">
          {/* Cancel button */}
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 
                     text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-md 
                     hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 
                     focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          {/* Publish/Unpublish button */}
          {onStatusChange && (
            status === 'published' ? (
              <button
                type="button"
                onClick={() => onStatusChange('draft')}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 
                         text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-md 
                         hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 
                         focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <EyeOff className="h-5 w-5 mr-2" />
                Unpublish
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStatusChange('published')}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-green-600 
                         text-green-600 bg-white dark:bg-slate-800 rounded-md 
                         hover:bg-green-50 dark:hover:bg-green-900/20 focus:outline-none focus:ring-2 
                         focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="h-5 w-5 mr-2" />
                Publish
              </button>
            )
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isProcessing={isSubmitting}
      />
    </>
  );
};

export default FormActions;
