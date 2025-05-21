import { FormActions as SharedFormActions } from '../../components/ui/Form';
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
    <SharedFormActions
      onCancel={() => navigate(isEditMode ? `/news/${id}` : '/news')}
      onDelete={isEditMode ? () => setShowDeleteConfirm(true) : undefined}
      submitText={getSubmitText()}
      isSubmitting={isSubmitting}
      isNew={!isEditMode}
      className="pt-4 border-t border-slate-200 dark:border-slate-700"
      align="between"
    />
  );
};

export default FormActions;
