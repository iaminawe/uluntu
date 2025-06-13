import { DeleteConfirmProps } from './types';
import { ConfirmationModal } from '@/shared/components/ui/Modal';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }: DeleteConfirmProps) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Opportunity"
      message="Are you sure you want to delete this opportunity? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
  );
};

export default DeleteConfirmModal;
