import React from 'react';

export interface BulkActionsPanelProps {
  selectedUsersCount: number;
  bulkActionRole: string;
  roles: any[] | undefined;
  isSuperAdmin: boolean;
  isAssigning: boolean;
  onRoleChange: (role: string) => void;
  onBulkAssign: () => void;
  onClearSelection: () => void;
}

/**
 * BulkActionsPanel - Panel for bulk role assignment
 * Features:
 * - Selected users count
 * - Role selection dropdown
 * - Bulk assign button
 * - Clear selection button
 */
export const BulkActionsPanel: React.FC<BulkActionsPanelProps> = ({
  selectedUsersCount,
  bulkActionRole,
  roles,
  isSuperAdmin,
  isAssigning,
  onRoleChange,
  onBulkAssign,
  onClearSelection
}) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            {selectedUsersCount} user{selectedUsersCount > 1 ? 's' : ''} selected
          </span>
          <select
            value={bulkActionRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-500/20"
          >
            <option value="">Select role to assign</option>
            {roles?.filter(role => role.id !== 'superadmin' || isSuperAdmin).map(role => (
              <option key={role.id} value={role.id}>{role.name}
                {role.id === 'superadmin' && !isSuperAdmin ? ' (Not Available)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={onBulkAssign}
            disabled={!bulkActionRole || isAssigning}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAssigning ? 'Assigning...' : 'Assign Role'}
          </button>
        </div>
        <button
          onClick={onClearSelection}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
};
