import React from 'react';
import {
  Search,
  RefreshCw,
  Download,
  Upload,
  UserPlus,
  ChevronDown,
  Ban,
  UserCheck,
  Archive,
  Trash2
} from 'lucide-react';

export interface UserFiltersProps {
  searchTerm: string;
  selectedRole: string;
  roles: any[] | undefined;
  selectedUsers: Set<string>;
  showBulkActions: boolean;
  isExporting: boolean;
  onSearchChange: (term: string) => void;
  onRoleChange: (role: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBulkActionsToggle: () => void;
  onBulkAction: (action: string) => void;
}

/**
 * UserFilters - Filter controls and action buttons
 * Features:
 * - Search input
 * - Role filter dropdown
 * - Bulk actions dropdown
 * - Export/Import buttons
 * - Refresh button
 */
export const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  selectedRole,
  roles,
  selectedUsers,
  showBulkActions,
  isExporting,
  onSearchChange,
  onRoleChange,
  onRefresh,
  onExport,
  onFileUpload,
  onBulkActionsToggle,
  onBulkAction
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by email, name, company, or location..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-500/20"
        >
          <option value="all">All Roles</option>
          {roles?.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
        {selectedUsers.size > 0 && (
          <div className="relative">
            <button
              onClick={onBulkActionsToggle}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedUsers.size})
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            {showBulkActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => onBulkAction('block')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                >
                  <Ban className="h-4 w-4 mr-2 text-orange-600" />
                  Block Selected
                </button>
                <button
                  onClick={() => onBulkAction('unblock')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                >
                  <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                  Unblock Selected
                </button>
                <button
                  onClick={() => onBulkAction('archive')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                >
                  <Archive className="h-4 w-4 mr-2 text-gray-600" />
                  Archive Selected
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => onBulkAction('delete')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={onExport}
            disabled={isExporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            title="Export to CSV"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>

          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Import
            <input
              type="file"
              accept=".csv"
              onChange={onFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
