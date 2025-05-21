import { DeleteConfirmProps } from './types';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting
}: DeleteConfirmProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Delete Listing
        </h3>
        <p className="text-slate-700 dark:text-slate-300 mb-6">
          Are you sure you want to delete this listing? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md
                      text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700
                       ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
