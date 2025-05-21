import { ConfirmDialog } from '../../components/ui/Dialog';
import { DeleteConfirmProps } from './types';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting
}: DeleteConfirmProps) => {
  return (
    <ConfirmDialog
      title="Delete Listing"
      message="Are you sure you want to delete this listing? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      isOpen={isOpen}
      isProcessing={isSubmitting}
      onConfirm={onConfirm}
      onCancel={onClose}
      type="danger"
    />
  );
};

export default DeleteConfirmModal;
