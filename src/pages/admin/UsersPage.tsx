import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { adminRolesApi } from '@/api/admin/roles';
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
  Mail
} from 'lucide-react';

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  roles: Array<{ role: { id: string; name: string } }>;
}

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Fetch users with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, selectedRole],
    queryFn: async () => {
      // Get all user roles with user info
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          *,
          role:roles(*),
          user:auth.users!user_id(
            id,
            email,
            created_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data
          )
        `);
      
      if (rolesError) throw rolesError;

      // Group by user
      const userMap = new Map<string, UserWithRoles>();
      
      userRoles?.forEach(userRole => {
        if (!userRole.user) return;
        
        const userId = userRole.user_id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            id: userId,
            email: userRole.user.email || '',
            created_at: userRole.user.created_at,
            last_sign_in_at: userRole.user.last_sign_in_at,
            app_metadata: userRole.user.raw_app_meta_data || {},
            user_metadata: userRole.user.raw_user_meta_data || {},
            roles: []
          });
        }
        
        const user = userMap.get(userId)!;
        if (userRole.role) {
          user.roles.push({ role: userRole.role });
        }
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
          user.roles.some(r => r.role?.id === selectedRole)
        );
      }

      return usersArray;
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

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          {roles?.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : users?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users?.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
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
                      {user.roles.map(userRole => (
                        <span
                          key={userRole.role.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {userRole.role.name}
                          <button
                            onClick={() => removeRoleMutation.mutate({
                              userId: user.id,
                              roleId: userRole.role.id
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
                !selectedUser.roles.some(ur => ur.role.id === role.id)
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