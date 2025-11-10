import { useState } from 'react';
import { FormActionsProps } from './types';
import { FormActions as SharedFormActions } from '@/shared/components/ui/Form';
import { ConfirmationModal } from '@/shared/components/ui/Modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/features/groups/api/groupsApi';
import { toast } from 'react-hot-toast';

const FormActions: React.FC<FormActionsProps> = ({
  isEditMode,
  isSubmitting,
  navigate,
  id
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: string) => groupsApi.delete(groupId),
    onSuccess: () => {
      toast.success('Group deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      navigate('/groups');
    },
    onError: (error) => {
      toast.error('Failed to delete group');
      console.error('Error deleting group:', error);
    }
  });

  const handleCancel = () => {
    navigate(isEditMode ? `/groups/${id}` : '/groups');
  };

  const handleDelete = async () => {
    if (isEditMode && id) {
      await deleteGroupMutation.mutateAsync(id);
    }
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
        isProcessing={deleteGroupMutation.isPending}
      />
    </>
  );
};

export default FormActions;
