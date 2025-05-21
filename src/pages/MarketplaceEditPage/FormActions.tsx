import { useNavigate } from 'react-router-dom';
import { FormActions as SharedFormActions } from '../../components/ui/Form';
import { FormActionsProps } from './types';

const FormActions: React.FC<FormActionsProps> = ({
  isEditing,
  isSubmitting,
  formData,
  setShowDeleteConfirm
}) => {
  const navigate = useNavigate();
  
  // Determine the submit button text based on the form state
  const getSubmitText = () => {
    switch (formData.status) {
      case 'draft':
        return 'Save as Draft';
      case 'published':
        return 'Publish Listing';
      case 'archived':
        return 'Archive Listing';
      default:
        return 'Save';
    }
  };
  
  return (
    <SharedFormActions
      // No onSubmit handler needed since this is handled by the form's onSubmit
      onCancel={() => navigate('/marketplace')}
      onDelete={isEditing ? () => setShowDeleteConfirm(true) : undefined}
      submitText={getSubmitText()}
      isSubmitting={isSubmitting}
      isNew={!isEditing}
      className="pt-6 border-t border-slate-200 dark:border-slate-700"
      align="between"
    />
  );
};

export default FormActions;
