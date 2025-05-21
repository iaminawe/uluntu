import { DeleteConfirmModalProps } from './types';

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleDelete
}) => {
  if (!showDeleteConfirm) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Delete Article
        </h3>
        <p className="text-slate-700 dark:text-slate-300 mb-6">
          Are you sure you want to delete this article? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md
                      text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
