import { Trash2 } from 'lucide-react';
import { FormActionsProps } from './types';

const FormActions: React.FC<FormActionsProps> = ({
  isEditMode,
  formData,
  isSubmitting,
  navigate,
  id,
  setShowDeleteConfirm
}) => {
  // Determine the submit button text based on the form state
  const getSubmitText = () => {
    if (isSubmitting) return 'Saving...';
    
    switch (formData.status) {
      case 'draft':
        return 'Save as Draft';
      case 'published':
        return 'Publish Article';
      case 'archived':
        return 'Archive Article';
      default:
        return 'Save';
    }
  };

  return (
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
          onClick={() => navigate(isEditMode ? `/news/${id}` : '/news')}
          disabled={isSubmitting}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 
                   text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-md 
                   hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 
                   focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {getSubmitText()}
        </button>
      </div>
    </div>
  );
};

export default FormActions;
