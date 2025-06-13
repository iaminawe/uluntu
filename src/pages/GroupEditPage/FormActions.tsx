import { useState } from 'react';
import { FormActionsProps } from './types';
import { FormActions as SharedFormActions } from '@/shared/components/ui/Form';
import { ConfirmationModal } from '@/shared/components/ui/Modal';

const FormActions: React.FC<FormActionsProps> = ({ 
  isEditMode, 
  isSubmitting, 
  navigate, 
  id 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleCancel = () => {
    navigate(isEditMode ? `/groups/${id}` : '/groups');
  };
  
  const handleDelete = () => {
    // In a real app, would make API call to delete the group
    console.log('Delete group with ID:', id);
    navigate('/groups');
  };
  
  return (
    <>
      <SharedFormActions
        onCancel={handleCancel}
        onDelete={isEditMode ? () => setShowDeleteConfirm(true) : undefined}
        submitText={isSubmitting ? 'Saving...' : 'Save Group'}
        isSubmitting={isSubmitting}
        isNew={!isEditMode}
        align="between"
        className="pt-4 border-t border-slate-200 dark:border-slate-700"
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Group"
        message="Are you sure you want to delete this group? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isProcessing={isSubmitting}
      />
    </>
  );
};

export default FormActions;
