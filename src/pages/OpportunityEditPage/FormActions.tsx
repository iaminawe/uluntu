import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormActions as SharedFormActions } from '../../components/ui/Form';
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
}

const FormActions: React.FC<FormActionsProps> = ({
  isEditMode,
  isSubmitting,
  formData,
  id,
  setShowDeleteConfirm
}) => {
  const navigate = useNavigate();
  
  const handleCancel = () => {
    navigate(isEditMode ? `/opportunities/${id}` : '/opportunities');
  };
  
  const getSubmitText = () => {
    if (isSubmitting) {
      return 'Saving...';
    }
    
    switch (formData.status) {
      case 'draft':
        return 'Save as Draft';
      case 'published':
        return 'Publish Opportunity';
      case 'archived':
        return 'Archive Opportunity';
      default:
        return 'Save';
    }
  };
  
  return (
    <SharedFormActions
      onCancel={handleCancel}
      onDelete={isEditMode ? () => setShowDeleteConfirm(true) : undefined}
      submitText={getSubmitText()}
      isSubmitting={isSubmitting}
      isNew={!isEditMode}
      align="between"
      className="pt-4 border-t border-slate-200 dark:border-slate-700"
    />
  );
};

export default FormActions;
