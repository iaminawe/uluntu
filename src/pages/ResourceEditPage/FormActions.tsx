// No longer need lucide-react icons as they're handled by the shared component
import { useNavigate } from 'react-router-dom';
import { FormActionsProps } from './types';
import { FormActions as SharedFormActions } from '../../components/ui/Form';

const FormActions: React.FC<FormActionsProps> = ({
  isEditing,
  isSubmitting,
  submitSuccess,
  formData,
  setShowDeleteConfirm
}) => {
  const navigate = useNavigate();
  
  // Determine the submit button text based on the form state
  const getSubmitText = () => {
    if (submitSuccess) {
      return 'Saved!';
    }
    
    switch (formData.status) {
      case 'draft':
        return 'Save as Draft';
      case 'published':
        return 'Publish Resource';
      case 'archived':
        return 'Archive Resource';
      default:
        return 'Save';
    }
  };
  
  return (
    <SharedFormActions
      // No onSubmit handler needed since this is handled by the form's onSubmit
      onCancel={() => navigate('/resources')}
      onDelete={isEditing ? () => setShowDeleteConfirm(true) : undefined}
      submitText={getSubmitText()}
      isSubmitting={isSubmitting}
      isNew={!isEditing}
      className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-6"
      align="between"
    />
  );
};

export default FormActions;
