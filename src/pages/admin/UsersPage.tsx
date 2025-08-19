import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { adminRolesApi } from '@/features/admin/api/roles';
import { useAuth } from '@/hooks/useAuth';
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
  UserPlus,
  User,
  Calendar,
  MapPin,
  Briefcase,
  Phone,
  Globe,
  Save,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AdminUser {
  user_id: string;
  email: string;
  name?: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
  member_profile?: {
    id: string;
    location?: string;
    title?: string;
    company?: string;
    bio?: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    status?: string;
    featured?: boolean;
  };
}

interface EditUserModalProps {
  user: AdminUser;
  onClose: () => void;
  onSave: (userId: string, updates: any) => Promise<void>;
  currentUserRoles: string[];
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave, currentUserRoles }) => {
  const [formData, setFormData] = useState({
    email: user.email,
    name: user.name || '',
    location: user.member_profile?.location || '',
    title: user.member_profile?.title || '',
    company: user.member_profile?.company || '',
    bio: user.member_profile?.bio || '',
    phone: user.member_profile?.phone || '',
    website: user.member_profile?.website || '',
    linkedin: user.member_profile?.linkedin || '',
    twitter: user.member_profile?.twitter || '',
    status: user.member_profile?.status || 'draft',
    featured: user.member_profile?.featured || false
  });

  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set(user.roles));
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = currentUserRoles.includes('superadmin');
  const canEditRoles = isSuperAdmin || currentUserRoles.includes('admin');

  const { data: availableRoles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => adminRolesApi.getRoles()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(user.user_id, {
        profile: formData,
        roles: Array.from(selectedRoles)
      });
      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (roleId: string) => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(roleId)) {
      newRoles.delete(roleId);
    } else {
      newRoles.add(roleId);
    }
    setSelectedRoles(newRoles);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Edit User Profile</h2>
          <p className="text-blue-100 text-sm mt-1">{user.email}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">Account Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  readOnly
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed here - managed by authentication system</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Visible)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">Profile Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Social Links */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn</label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter</label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="mt-6 flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured Member</span>
            </label>
          </div>

          {/* Role Assignment */}
          {canEditRoles && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Role Assignment {isSuperAdmin && <span className="text-sm font-normal text-blue-600">(Super Admin)</span>}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableRoles?.map(role => {
                  const hasRole = selectedRoles.has(role.id);
                  const canToggleRole = isSuperAdmin || role.id !== 'superadmin';
                  
                  return (
                    <label
                      key={role.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        hasRole 
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                          : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                      } ${!canToggleRole ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    >
                      <input
                        type="checkbox"
                        checked={hasRole}
                        onChange={() => canToggleRole && toggleRole(role.id)}
                        disabled={!canToggleRole}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{role.name}</div>
                        {role.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{role.description}</div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              {!isSuperAdmin && (
                <p className="text-xs text-gray-500 mt-2">
                  Note: Only Super Admins can assign the Super Admin role
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionRole, setBulkActionRole] = useState<string>('');

  // Get current user roles for permission checks
  const { data: currentUserRoles = [] } = useQuery({
    queryKey: ['current-user-roles', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id);
      return data?.map(r => r.role) || [];
    },
    enabled: !!currentUser?.id
  });

  const isSuperAdmin = currentUserRoles.includes('superadmin');
  const isAdmin = currentUserRoles.includes('admin') || isSuperAdmin;

  // Fetch users with their roles using the proper database function
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', searchTerm, selectedRole],
    queryFn: async () => {
      try {
        // First try the get_admin_users function
        const { data: adminUsersData, error: functionError } = await supabase
          .rpc('get_admin_users');

        if (functionError) {
          console.warn('Database function failed:', functionError);
          throw functionError;
        }

        // Convert to our interface format
        let usersArray: AdminUser[] = adminUsersData?.map(user => ({
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          roles: user.roles || []
        })) || [];

        // Get member profiles for each user
        const userIds = usersArray.map(u => u.user_id);
        if (userIds.length > 0) {
          const { data: memberProfiles } = await supabase
            .from('members')
            .select('*')
            .in('user_id', userIds);

          // Attach member profiles
          usersArray = usersArray.map(user => {
            const profile = memberProfiles?.find(p => p.user_id === user.user_id);
            return {
              ...user,
              member_profile: profile ? {
                id: profile.id,
                location: profile.location,
                title: profile.title,
                company: profile.company,
                bio: profile.bio,
                phone: profile.phone,
                website: profile.website,
                linkedin: profile.linkedin,
                twitter: profile.twitter,
                status: profile.status,
                featured: profile.featured
              } : undefined
            };
          });
        }

        // Apply filters
        let filteredUsers = usersArray;

        if (searchTerm) {
          filteredUsers = filteredUsers.filter(user =>
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.member_profile?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.member_profile?.location?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (selectedRole !== 'all') {
          filteredUsers = filteredUsers.filter(user =>
            user.roles.includes(selectedRole)
          );
        }

        return filteredUsers;
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        return [];
      }
    },
    enabled: isAdmin
  });

  // Fetch available roles
  const { data: roles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => adminRolesApi.getRoles()
  });

  // Save user changes (profile + roles)
  const saveUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: { profile: any; roles: string[] } }) => {
      const { profile, roles } = updates;
      
      // Update member profile
      const { error: profileError } = await supabase
        .from('members')
        .upsert({
          user_id: userId,
          name: profile.name,
          location: profile.location,
          title: profile.title,
          company: profile.company,
          bio: profile.bio,
          phone: profile.phone,
          website: profile.website,
          linkedin: profile.linkedin,
          twitter: profile.twitter,
          status: profile.status,
          featured: profile.featured,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Update user roles if user has permission
      if (canEditRoles && currentUser?.id !== userId) {
        // Get current roles
        const { data: currentRolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
        
        const currentRoles = currentRolesData?.map(r => r.role) || [];
        
        // Find roles to add and remove
        const rolesToAdd = roles.filter(r => !currentRoles.includes(r));
        const rolesToRemove = currentRoles.filter(r => !roles.includes(r));
        
        // Only allow superadmin role changes if current user is superadmin
        const filteredRolesToAdd = rolesToAdd.filter(r => r !== 'superadmin' || isSuperAdmin);
        const filteredRolesToRemove = rolesToRemove.filter(r => r !== 'superadmin' || isSuperAdmin);
        
        // Remove old roles
        if (filteredRolesToRemove.length > 0) {
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .in('role', filteredRolesToRemove);
        }
        
        // Add new roles
        if (filteredRolesToAdd.length > 0) {
          await supabase
            .from('user_roles')
            .insert(filteredRolesToAdd.map(role => ({ user_id: userId, role, created_at: new Date().toISOString() })));
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated successfully');
      setEditingUser(null);
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  });

  const canEditRoles = isAdmin;

  // Bulk assign role to multiple users
  const bulkAssignRoleMutation = useMutation({
    mutationFn: async ({ userIds, roleId }: { userIds: string[]; roleId: string }) => {
      // Only allow superadmin role assignment if current user is superadmin
      if (roleId === 'superadmin' && !isSuperAdmin) {
        throw new Error('Only Super Admins can assign Super Admin role');
      }
      
      const insertData = userIds.map(userId => ({ user_id: userId, role: roleId, created_at: new Date().toISOString() }));
      
      const { error } = await supabase
        .from('user_roles')
        .insert(insertData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUsers(new Set());
      setShowBulkActions(false);
      setBulkActionRole('');
      toast.success('Roles assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign roles');
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
      setSelectedUsers(new Set(users.map(user => user.user_id)));
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

  // Handle save user
  const handleSaveUser = async (userId: string, updates: any) => {
    await saveUserMutation.mutateAsync({ userId, updates });
  };

  if (!isAdmin) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-2xl mx-auto text-center mt-20">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need admin or superadmin privileges to access user management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">User Management
            {isSuperAdmin && <span className="text-sm font-normal text-blue-600 ml-2">(Super Admin)</span>}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage user accounts, profiles, roles, and permissions • {users?.length || 0} users total
          </p>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by email, name, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-500/20"
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
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                  </span>
                  <select
                    value={bulkActionRole}
                    onChange={(e) => setBulkActionRole(e.target.value)}
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
                    onClick={handleBulkAssign}
                    disabled={!bulkActionRole || bulkAssignRoleMutation.isPending}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={(users?.length ?? 0) > 0 && selectedUsers.size === (users?.length ?? 0)}
                    onChange={(e) => handleSelectAll(e.target.checked)}
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
                          onChange={(e) => handleUserSelect(user.user_id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                        <button
                          onClick={() => setEditingUser(user)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={handleSaveUser}
            currentUserRoles={currentUserRoles}
          />
        )}
      </div>
    </div>
  );
};

export default UsersPage;