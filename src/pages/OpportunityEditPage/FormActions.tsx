import { useNavigate } from 'react-router-dom';
import { FormActions as SharedFormActions } from '@/shared/components/ui/Form';
import { Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { FormData } from './types';

export interface FormActionsProps {
  /**
   * Whether the form is in edit mode
   */
  isEditMode: boolean;
  /**
   * Whether the form is currently submitting
   */
  isSubmitting: boolean;
  /**
   * Current form data
   */
  formData: FormData;
  /**
   * ID of the opportunity (only in edit mode)
   */
  id?: string;
  /**
   * Function to show the delete confirmation modal
   */
  setShowDeleteConfirm: (show: boolean) => void;
  /**
   * Function to update form data
   */
  setFormData?: React.Dispatch<React.SetStateAction<FormData>>;
}

const FormActions: React.FC<FormActionsProps> = ({
  isEditMode,
  isSubmitting,
  formData,
  id,
  setShowDeleteConfirm,
  setFormData
}) => {
  const navigate = useNavigate();
  
  const handleCancel = () => {
    navigate(isEditMode ? `/opportunities/${id}` : '/opportunities');
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
        {setFormData && (
          formData.status === 'published' ? (
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
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
              onClick={() => setFormData(prev => ({ ...prev, status: 'published' }))}
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
          className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Opportunity'}
        </button>
      </div>
    </div>
  );
};

export default FormActions;
