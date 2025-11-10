import React from 'react';
import {
  User,
  MapPin,
  Shield,
  CheckCircle,
  Ban,
  Edit,
  UserCheck,
  Archive,
  Trash2,
  MoreHorizontal,
  Users
} from 'lucide-react';
import { AdminUser } from '../types';

export interface UserTableProps {
  users: AdminUser[] | undefined;
  roles: any[] | undefined;
  isLoading: boolean;
  selectedUsers: Set<string>;
  showActionDropdown: string | null;
  pageSize: number;
  currentPage: number;
  onSelectAll: (checked: boolean) => void;
  onSelectUser: (userId: string, checked: boolean) => void;
  onUserAction: (userId: string, action: string) => void;
  onActionDropdownToggle: (userId: string | null) => void;
  onPageChange: (page: number) => void;
  formatDate: (date: string | null) => string;
}

/**
 * UserTable - Main table component for displaying users
 * Features:
 * - Checkbox selection (individual and select all)
 * - User info display with profile details
 * - Role badges with color coding
 * - Status indicators
 * - Action dropdown menu
 * - Pagination controls
 */
export const UserTable: React.FC<UserTableProps> = ({
  users,
  roles,
  isLoading,
  selectedUsers,
  showActionDropdown,
  pageSize,
  currentPage,
  onSelectAll,
  onSelectUser,
  onUserAction,
  onActionDropdownToggle,
  onPageChange,
  formatDate
}) => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={(users?.length ?? 0) > 0 && selectedUsers.size === (users?.length ?? 0)}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Profile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Sign In
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : users?.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <div className="text-sm">No users found</div>
                  <div className="text-xs mt-1">Try adjusting your search or filters</div>
                </td>
              </tr>
            ) : (
              users?.map(user => {
                const profile = user.member_profile;
                return (
                  <tr key={user.user_id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.user_id)}
                        onChange={(e) => onSelectUser(user.user_id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            user.email === 'No account'
                              ? 'bg-orange-100 dark:bg-orange-900/30'
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}>
                            <User className={`h-5 w-5 ${
                              user.email === 'No account'
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${
                            user.email === 'No account'
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {user.email}
                          </div>
                          {user.name && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{profile?.title || '-'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{profile?.company || '-'}</div>
                      {profile?.location && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {profile.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.email === 'No account' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                            Orphaned Profile
                          </span>
                        ) : (
                          <>
                            {user.roles.map(roleId => {
                              const role = roles?.find(r => r.id === roleId);
                              return (
                                <span
                                  key={roleId}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    roleId === 'superadmin'
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                      : roleId === 'admin'
                                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                  }`}
                                >
                                  {role?.name || roleId}
                                  {roleId === 'superadmin' && <Shield className="h-3 w-3 ml-1" />}
                                </span>
                              );
                            })}
                            {user.roles.length === 0 && (
                              <span className="text-xs text-gray-400 italic">No roles</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        profile?.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : profile?.status === 'archived'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {profile?.status === 'published' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {profile?.status === 'archived' && <Ban className="h-3 w-3 mr-1" />}
                        {profile?.status || 'Draft'}
                      </span>
                      {profile?.featured && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                          ⭐ Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.last_sign_in_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative">
                        <button
                          onClick={() => onActionDropdownToggle(showActionDropdown === user.user_id ? null : user.user_id)}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {showActionDropdown === user.user_id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                            <button
                              onClick={() => onUserAction(user.user_id, 'edit')}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                            >
                              <Edit className="h-4 w-4 mr-2 text-blue-600" />
                              {user.email === 'No account' ? 'View' : 'Edit'}
                            </button>
                            {user.email !== 'No account' && (
                              <>
                                {user.member_profile?.status !== 'blocked' ? (
                                  <button
                                    onClick={() => onUserAction(user.user_id, 'block')}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                                  >
                                    <Ban className="h-4 w-4 mr-2 text-orange-600" />
                                    Block
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onUserAction(user.user_id, 'unblock')}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                                  >
                                    <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                    Unblock
                                  </button>
                                )}
                                <button
                                  onClick={() => onUserAction(user.user_id, 'archive')}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                                >
                                  <Archive className="h-4 w-4 mr-2 text-gray-600" />
                                  Archive
                                </button>
                                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                <button
                                  onClick={() => onUserAction(user.user_id, 'delete')}
                                  className="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center text-sm text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {users && users.length >= pageSize && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={users.length < pageSize}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page <span className="font-medium">{currentPage}</span>
                  {users.length === pageSize && ' (may have more)'}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={users.length < pageSize}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
