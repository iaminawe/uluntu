import { Save, Trash2 } from 'lucide-react';
import { FormActionsProps } from './types';

const FormActions: React.FC<FormActionsProps> = ({ 
  isEditMode, 
  isSubmitting, 
  navigate, 
  id 
}) => {
  return (
    <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={() => navigate(isEditMode ? `/groups/${id}` : '/groups')}
        className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                  text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 
                  transition-colors"
      >
        Cancel
      </button>
      
      {isEditMode && (
        <button
          type="button"
          className="px-6 py-2 border border-red-300 text-red-600 rounded-lg 
                    hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-6 py-2 bg-orange-500 text-white rounded-lg 
                  hover:bg-orange-600 transition-colors flex items-center gap-2
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <Save className="h-5 w-5" />
        {isSubmitting ? 'Saving...' : 'Save Group'}
      </button>
    </div>
  );
};

export default FormActions;
