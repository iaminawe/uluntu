import { ConfirmDialog } from '@/shared/components/ui/Dialog';
import { DeleteConfirmModalProps } from './types';

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleDelete,
  isSubmitting = false
}) => {
  return (
    <ConfirmDialog
      isOpen={showDeleteConfirm}
      onCancel={() => setShowDeleteConfirm(false)}
      onConfirm={handleDelete}
      title="Delete Article"
      message="Are you sure you want to delete this article? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      isProcessing={isSubmitting}
    />
  );
};

export default DeleteConfirmModal;
