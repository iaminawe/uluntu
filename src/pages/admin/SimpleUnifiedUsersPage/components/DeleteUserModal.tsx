import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { AdminUser, DeleteOptions } from '../types';

export interface DeleteUserModalProps {
  user: AdminUser;
  users: AdminUser[];
  deleteOptions: DeleteOptions;
  onClose: () => void;
  onDelete: () => Promise<void>;
  onOptionsChange: (options: DeleteOptions) => void;
}

/**
 * DeleteUserModal - Confirmation modal for user deletion
 * Features:
 * - Content management options (delete, reassign, anonymize)
 * - User reassignment dropdown
 * - Safety warnings and confirmations
 */
export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  user,
  users,
  deleteOptions,
  onClose,
  onDelete,
  onOptionsChange
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2" />
            Delete User
          </h2>
          <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You are about to delete the user: <strong>{user.email}</strong>
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                What should happen to this user's content?
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="radio"
                  name="deleteOption"
                  checked={!deleteOptions.deleteContent && !deleteOptions.reassignTo && !deleteOptions.makeAnonymous}
                  onChange={() => onOptionsChange({ deleteContent: false, reassignTo: '', makeAnonymous: false })}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Keep content as-is</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Content will remain but user profile will be deleted</p>
                </div>
              </label>

              <label className="flex items-start">
                <input
                  type="radio"
                  name="deleteOption"
                  checked={deleteOptions.deleteContent}
                  onChange={() => onOptionsChange({ deleteContent: true, reassignTo: '', makeAnonymous: false })}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Delete all content</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">All posts, events, groups, etc. will be permanently deleted</p>
                </div>
              </label>

              <label className="flex items-start">
                <input
                  type="radio"
                  name="deleteOption"
                  checked={deleteOptions.makeAnonymous}
                  onChange={() => onOptionsChange({ deleteContent: false, reassignTo: '', makeAnonymous: true })}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Make content anonymous</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Remove author attribution from all content</p>
                </div>
              </label>

              <div>
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="deleteOption"
                    checked={!!deleteOptions.reassignTo}
                    onChange={() => onOptionsChange({ deleteContent: false, reassignTo: 'select', makeAnonymous: false })}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Reassign to another user</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Transfer ownership to selected user</p>
                    {deleteOptions.reassignTo && (
                      <select
                        value={deleteOptions.reassignTo === 'select' ? '' : deleteOptions.reassignTo}
                        onChange={(e) => onOptionsChange({ ...deleteOptions, reassignTo: e.target.value })}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        <option value="">Select a user...</option>
                        {users?.filter(u => u.user_id !== user.user_id && u.email !== 'No account').map(u => (
                          <option key={u.user_id} value={u.user_id}>
                            {u.name || u.email}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                onClose();
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              disabled={deleteOptions.reassignTo === 'select' || (deleteOptions.reassignTo && !deleteOptions.reassignTo)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
