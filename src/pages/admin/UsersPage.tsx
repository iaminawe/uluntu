import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { adminRolesApi } from '@/features/admin/api/roles';
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Mail,
  Users,
  Plus,
  UserPlus
} from 'lucide-react';

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  roles: Array<{ id: string; name: string }>;
}

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionRole, setBulkActionRole] = useState<string>('');

  // Helper function to format role names
  const formatRoleName = (roleId: string): string => {
    const roleMap: Record<string, string> = {
      'authenticated': 'Authenticated',
      'group_member': 'Group Member', 
      'admin': 'Administrator',
      'superadmin': 'Super Administrator'
    };
    return roleMap[roleId] || roleId;
  };

  // Fetch users with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, selectedRole],
    queryFn: async () => {
      try {
        // Try using the database function first (disabled - function not available)
        // const { data: adminUsersData, error: functionError } = await supabase
        //   .rpc('get_admin_users');

        // if (functionError) {
        //   console.warn('Database function failed, falling back to manual query:', functionError);
          
          // Fallback: Get all user roles
          const { data: userRoles, error: rolesError } = await supabase
            .from('user_roles')
            .select('user_id, role');
          
          if (rolesError) {
            console.error('Error fetching user roles:', rolesError);
            return [];
          }

          // Group by user ID and create simplified user objects
          const userMap = new Map<string, UserWithRoles>();
          
          userRoles?.forEach(userRole => {
            const userId = userRole.user_id;
            
            if (!userMap.has(userId)) {
              userMap.set(userId, {
                id: userId,
                email: `user-${userId.substring(0, 8)}@example.com`,
                created_at: new Date().toISOString(),
                last_sign_in_at: null,
                app_metadata: {},
                user_metadata: { name: `User ${userId.substring(0, 8)}` },
                roles: []
              });
            }
            
            const user = userMap.get(userId)!;
            user.roles.push({ id: userRole.role, name: formatRoleName(userRole.role) });
          });

          let usersArray = Array.from(userMap.values());

          // Filter by search term
          if (searchTerm) {
            usersArray = usersArray.filter(user =>
              user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.user_metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          // Filter by role
          if (selectedRole !== 'all') {
            usersArray = usersArray.filter(user =>
              user.roles.some(r => r.id === selectedRole)
            );
          }

          return usersArray;
        // }

        // Convert database function results to UserWithRoles format (disabled)
        // const usersArray: UserWithRoles[] = adminUsersData?.map(user => ({
        //   id: user.user_id,
        //   email: user.email || `user-${user.user_id.substring(0, 8)}@example.com`,
        //   created_at: user.created_at,
        //   last_sign_in_at: user.last_sign_in_at,
        //   app_metadata: {},
        //   user_metadata: { name: user.name || 'Unknown User' },
        //   roles: Array.isArray(user.roles) ? user.roles.map(role => ({ id: role, name: formatRoleName(role) })) : []
        // })) || [];

        // Apply filters
        // let filteredUsers = usersArray;

        // if (searchTerm) {
        //   filteredUsers = filteredUsers.filter(user =>
        //     user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        //     user.user_metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        //   );
        // }

        // if (selectedRole !== 'all') {
        //   filteredUsers = filteredUsers.filter(user =>
        //     user.roles.some(r => r.id === selectedRole)
        //   );
        // }

        // return filteredUsers;
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    }
  });

  // Fetch available roles
  const { data: roles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => adminRolesApi.getRoles()
  });

  // Assign role to user
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      await adminRolesApi.assignRole(userId, roleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowRoleModal(false);
    }
  });

  // Remove role from user
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      await adminRolesApi.removeRole(userId, roleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  // Bulk assign role to multiple users
  const bulkAssignRoleMutation = useMutation({
    mutationFn: async ({ userIds, roleId }: { userIds: string[]; roleId: string }) => {
      const promises = userIds.map(userId => adminRolesApi.assignRole(userId, roleId));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUsers(new Set());
      setShowBulkActions(false);
      setBulkActionRole('');
    }
  });

  // Handle user selection
  const handleUserSelect = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Handle select all users
  const handleSelectAll = (checked: boolean) => {
    if (checked && users) {
      setSelectedUsers(new Set(users.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // Handle bulk role assignment
  const handleBulkAssign = () => {
    if (bulkActionRole && selectedUsers.size > 0) {
      bulkAssignRoleMutation.mutate({
        userIds: Array.from(selectedUsers),
        roleId: bulkActionRole
      });
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring focus:ring-orange-200 dark:focus:ring-orange-500/20"
          >
            <option value="all">All Roles</option>
            {roles?.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          {selectedUsers.size > 0 && (
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedUsers.size})
            </button>
          )}
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedUsers.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-blue-700 font-medium">
                  {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                </span>
                <select
                  value={bulkActionRole}
                  onChange={(e) => setBulkActionRole(e.target.value)}
                  className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring focus:ring-orange-200 dark:focus:ring-orange-500/20"
                >
                  <option value="">Select role to assign</option>
                  {roles?.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAssign}
                  disabled={!bulkActionRole || bulkAssignRoleMutation.isPending}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkAssignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedUsers(new Set());
                  setShowBulkActions(false);
                  setBulkActionRole('');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={(users?.length ?? 0) > 0 && selectedUsers.size === (users?.length ?? 0)}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Sign In
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : users?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users?.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                      {user.user_metadata?.name && (
                        <div className="text-sm text-gray-500">
                          {user.user_metadata.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <span
                          key={role.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {role.name}
                          <button
                            onClick={() => removeRoleMutation.mutate({
                              userId: user.id,
                              roleId: role.id
                            })}
                            className="ml-1 hover:text-blue-600"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        + Add Role
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.last_sign_in_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Assign Role to {selectedUser.email}
            </h3>
            <div className="space-y-2">
              {roles?.filter(role => 
                !selectedUser.roles.some(ur => ur.id === role.id)
              ).map(role => (
                <button
                  key={role.id}
                  onClick={() => assignRoleMutation.mutate({
                    userId: selectedUser.id,
                    roleId: role.id
                  })}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="font-medium">{role.name}</div>
                  {role.description && (
                    <div className="text-sm text-gray-500">{role.description}</div>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRoleModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;