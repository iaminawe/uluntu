import { DeleteConfirmProps } from './types';
import { ConfirmDialog } from '../../components/ui/Dialog';

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  show,
  setShow,
  handleDelete,
  isSubmitting
}) => {
  return (
    <ConfirmDialog
      title="Delete Resource"
      message="Are you sure you want to delete this resource? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      isOpen={show}
      isProcessing={isSubmitting}
      onConfirm={handleDelete}
      onCancel={() => setShow(false)}
      type="danger"
    />
  );
};

export default DeleteConfirm;
