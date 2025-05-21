import { Save, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FormActionsProps } from './types';

const FormActions: React.FC<FormActionsProps> = ({
  isEditing,
  isSubmitting,
  submitSuccess,
  formData,
  setShowDeleteConfirm
}) => {
  return (
    <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
      <div className="flex space-x-2">
        <Link
          to="/resources"
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 
                    text-slate-700 dark:text-slate-300 rounded-md 
                    hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </Link>
        
        {isEditing && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-md 
                      hover:bg-red-50 transition-colors flex items-center"
            disabled={isSubmitting}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-4 py-2 bg-orange-500 text-white rounded-md 
                  hover:bg-orange-600 transition-colors flex items-center
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          <>
            <Save className="h-5 w-5 mr-2" />
            {submitSuccess 
              ? 'Saved!' 
              : formData.status === 'draft' 
                ? 'Save as Draft' 
                : formData.status === 'published' 
                  ? 'Publish Resource' 
                  : 'Archive Resource'}
          </>
        )}
      </button>
    </div>
  );
};

export default FormActions;
