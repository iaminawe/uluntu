import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRolesApi } from '@/features/admin/api/roles';
import { Role } from '@/types/admin';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Lock,
  Users,
  Key,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const RolesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {} as Record<string, string[]>
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => adminRolesApi.getRoles()
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (data: Omit<Role, 'id' | 'created_at' | 'updated_at'>) =>
      adminRolesApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setShowCreateModal(false);
      resetForm();
      setNotification({
        type: 'success',
        message: 'Role created successfully!'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) =>
      adminRolesApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setEditingRole(null);
      resetForm();
      setNotification({
        type: 'success',
        message: 'Role updated successfully!'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => adminRolesApi.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setNotification({
        type: 'success',
        message: 'Role deleted successfully!'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: {}
    });
  };

  const resources = [
    { key: 'members', label: 'Members', icon: '👤' },
    { key: 'companies', label: 'Companies', icon: '🏢' },
    { key: 'groups', label: 'Groups', icon: '👥' },
    { key: 'events', label: 'Events', icon: '📅' },
    { key: 'news', label: 'News', icon: '📰' },
    { key: 'resources', label: 'Resources', icon: '📚' },
    { key: 'marketplace', label: 'Marketplace', icon: '🛍️' },
    { key: 'opportunities', label: 'Opportunities', icon: '💼' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'moderation', label: 'Moderation', icon: '🛡️' },
    { key: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const actions = ['create', 'read', 'update', 'delete'];

  const handlePermissionToggle = (resource: string, action: string) => {
    const currentActions = formData.permissions[resource] || [];
    const newActions = currentActions.includes(action)
      ? currentActions.filter(a => a !== action)
      : [...currentActions, action];

    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [resource]: newActions.length > 0 ? newActions : undefined
      }
    });
  };

  const handleWildcardToggle = (resource: string) => {
    const hasWildcard = formData.permissions[resource]?.includes('*');
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [resource]: hasWildcard ? [] : ['*']
      }
    });
  };

  const handleSubmit = () => {
    // Clean up empty permission arrays
    const cleanedPermissions = Object.entries(formData.permissions).reduce((acc, [key, value]) => {
      if (value && value.length > 0) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string[]>);

    const data = {
      name: formData.name,
      description: formData.description || null,
      permissions: cleanedPermissions,
      is_system: false
    };

    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data }, {
        onError: (error: any) => {
          setNotification({
            type: 'error',
            message: error?.message || 'Failed to update role. Please try again.'
          });
          setTimeout(() => setNotification(null), 5000);
        }
      });
    } else {
      createRoleMutation.mutate(data, {
        onError: (error: any) => {
          setNotification({
            type: 'error',
            message: error?.message || 'Failed to create role. Please try again.'
          });
          setTimeout(() => setNotification(null), 5000);
        }
      });
    }
  };

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions
    });
  };

  return (
    <div>
      {/* Notification Banner */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg flex items-center ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage user roles with granular permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </button>
      </div>

      {/* Roles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Loading roles...
          </div>
        ) : roles && roles.length > 0 ? (
          roles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                    {role.description && (
                      <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                    )}
                  </div>
                </div>
                {role.is_system && (
                  <Lock className="h-5 w-5 text-gray-400" title="System role" />
                )}
              </div>

              {/* Permission Summary */}
              <div className="space-y-2 mb-4">
                {role.permissions && Object.keys(role.permissions).length > 0 ? (
                  Object.entries(role.permissions).map(([resource, actions]) => (
                    <div key={resource} className="text-sm">
                      <span className="font-medium text-gray-700">{resource}:</span>
                      <span className="ml-2 text-gray-600">
                        {Array.isArray(actions) && actions.includes('*') ? 'All permissions' : Array.isArray(actions) ? actions.join(', ') : 'No permissions'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">No permissions defined</div>
                )}
              </div>

              {/* Actions */}
              {!role.is_system && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(role)}
                    className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
                        deleteRoleMutation.mutate(role.id, {
                          onError: (error: any) => {
                            setNotification({
                              type: 'error',
                              message: error?.message || 'Failed to delete role. Please try again.'
                            });
                            setTimeout(() => setNotification(null), 5000);
                          }
                        });
                      }
                    }}
                    className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first custom role.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Role
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingRole) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Basic Info */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Content Manager"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of this role's purpose"
                />
              </div>

              {/* Permissions */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Permissions</h4>
                
                {/* Super Admin Wildcard */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions['*']?.includes('*')}
                      onChange={() => {
                        if (formData.permissions['*']?.includes('*')) {
                          setFormData({ ...formData, permissions: {} });
                        } else {
                          setFormData({ ...formData, permissions: { '*': ['*'] } });
                        }
                      }}
                      className="mr-3"
                    />
                    <span className="font-medium">Full System Access (Super Admin)</span>
                  </label>
                </div>

                {/* Resource Permissions */}
                {!formData.permissions['*']?.includes('*') && (
                  <div className="space-y-4">
                    {resources.map((resource) => (
                      <div key={resource.key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{resource.icon}</span>
                            <span className="font-medium text-gray-900">{resource.label}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleWildcardToggle(resource.key)}
                            className={`px-3 py-1 text-sm rounded ${
                              formData.permissions[resource.key]?.includes('*')
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            All Permissions
                          </button>
                        </div>
                        
                        {!formData.permissions[resource.key]?.includes('*') && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {actions.map((action) => (
                              <label key={action} className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.permissions[resource.key]?.includes(action) || false}
                                  onChange={() => handlePermissionToggle(resource.key, action)}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700 capitalize">{action}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingRole(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingRole ? 'Update' : 'Create'} Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;