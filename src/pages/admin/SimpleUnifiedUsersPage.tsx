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
  X,
  RefreshCw,
  Download,
  Upload,
  FileDown,
  FileUp,
  Archive,
  MoreHorizontal,
  UserX,
  UserCheck,
  AlertTriangle,
  ChevronDown
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
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    email: user.email,
    name: user.name || '',
    location: user.member_profile?.location || '',
    title: user.member_profile?.title || '',
    company: user.member_profile?.company || '',
    bio: user.member_profile?.bio || '',
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
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <User className="inline-block h-4 w-4 mr-2" />
              Account
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Briefcase className="inline-block h-4 w-4 mr-2" />
              Profile
            </button>
            {canEditRoles && (
              <button
                type="button"
                onClick={() => setActiveTab('roles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Shield className="inline-block h-4 w-4 mr-2" />
                Roles
              </button>
            )}
          </nav>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
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
                  placeholder="Enter full name"
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Featured Member
                </label>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && canEditRoles && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Role Assignment 
                  {isSuperAdmin && <span className="text-sm font-normal text-blue-600 ml-2">(Super Admin)</span>}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {availableRoles?.map(role => {
                    const hasRole = selectedRoles.has(role.id);
                    const canToggleRole = isSuperAdmin || role.id !== 'superadmin';
                    
                    return (
                      <label
                        key={role.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          hasRole 
                            ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700'
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
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{role.name}</div>
                          {role.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{role.description}</div>
                          )}
                        </div>
                        {role.id === 'superadmin' && (
                          <Shield className="h-4 w-4 text-red-500 ml-2" />
                        )}
                      </label>
                    );
                  })}
                </div>
                {!isSuperAdmin && (
                  <p className="text-xs text-gray-500 mt-3">
                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                    Note: Only Super Admins can assign the Super Admin role
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {user.email !== 'No account' && (
                  <>
                    {user.member_profile?.status !== 'blocked' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSave(user.user_id, {
                            profile: { ...formData, status: 'blocked' },
                            roles: Array.from(selectedRoles)
                          });
                        }}
                        className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center text-sm"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Block
                      </button>
                    )}
                    {user.member_profile?.status === 'blocked' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSave(user.user_id, {
                            profile: { ...formData, status: 'published' },
                            roles: Array.from(selectedRoles)
                          });
                        }}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Unblock
                      </button>
                    )}
                    {user.member_profile?.status !== 'archived' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSave(user.user_id, {
                            profile: { ...formData, status: 'archived' },
                            roles: Array.from(selectedRoles)
                          });
                        }}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm"
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="flex space-x-3">
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
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const SimpleUnifiedUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionRole, setBulkActionRole] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showOrphanedProfiles, setShowOrphanedProfiles] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<AdminUser | null>(null);
  const [deleteOptions, setDeleteOptions] = useState({
    deleteContent: false,
    reassignTo: '',
    makeAnonymous: false
  });
  const [showActionDropdown, setShowActionDropdown] = useState<string | null>(null);
  const [showBatchActionsDropdown, setShowBatchActionsDropdown] = useState(false);

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
    queryKey: ['admin-users', searchTerm, selectedRole, currentPage, pageSize, showOrphanedProfiles],
    queryFn: async () => {
      try {
        let usersArray: AdminUser[] = [];
        
        if (showOrphanedProfiles) {
          // Get ALL member profiles
          const { data: allProfiles } = await supabase
            .from('members')
            .select('*')
            .order('created_at', { ascending: false });
          
          // Get all user IDs that have accounts
          const { data: adminUsersData } = await supabase
            .rpc('get_admin_users');
          
          const userIdsWithAccounts = new Set(adminUsersData?.map(u => u.user_id) || []);
          
          // Filter for orphaned profiles (no user account)
          const orphanedProfiles = allProfiles?.filter(p => 
            !p.user_id || !userIdsWithAccounts.has(p.user_id)
          ) || [];
          
          // Convert orphaned profiles to AdminUser format
          usersArray = orphanedProfiles.map(profile => ({
            user_id: profile.user_id || profile.id, // Use profile ID as fallback
            email: profile.email || 'No account',
            name: profile.name || 'Unknown',
            created_at: profile.created_at,
            last_sign_in_at: null,
            roles: [],
            member_profile: {
              id: profile.id,
              location: profile.location,
              title: profile.title,
              company: profile.company,
              bio: profile.bio,
              status: profile.status,
              featured: profile.featured
            }
          }));
        } else {
          // Normal flow - get users with accounts
          const { data: adminUsersData, error: functionError } = await supabase
            .rpc('get_admin_users');

          if (functionError) {
            console.warn('Database function failed:', functionError);
            throw functionError;
          }

          // Convert to our interface format
          usersArray = adminUsersData?.map(user => ({
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
                  status: profile.status,
                  featured: profile.featured
                } : undefined
              };
            });
          }
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

        // Apply pagination
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredUsers.slice(startIndex, endIndex);

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
        
        // Use server-side function to manage roles (avoids recursion)
        for (const role of filteredRolesToRemove) {
          const { data, error } = await supabase
            .rpc('manage_user_roles', {
              target_user_id: userId,
              target_role: role,
              action: 'remove'
            });
          
          if (error) {
            console.error('Error removing role:', error);
            throw error;
          }
        }
        
        // Add new roles using server-side function
        for (const role of filteredRolesToAdd) {
          const { data, error } = await supabase
            .rpc('manage_user_roles', {
              target_user_id: userId,
              target_role: role,
              action: 'add'
            });
          
          if (error) {
            console.error('Error adding role:', error);
            throw error;
          }
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
      
      // Use server-side function for bulk role management (avoids recursion)
      const { data, error } = await supabase
        .rpc('bulk_manage_user_roles', {
          user_ids: userIds,
          target_role: roleId,
          action: 'add'
        });
      
      if (error) throw error;
      
      // Check if the operation was successful
      if (data && !data.success) {
        throw new Error(data.error || 'Failed to assign roles');
      }
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

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    const userIds = Array.from(selectedUsers);
    
    try {
      switch (action) {
        case 'block':
          for (const userId of userIds) {
            await supabase
              .from('members')
              .update({ status: 'blocked', updated_at: new Date().toISOString() })
              .eq('user_id', userId);
          }
          toast.success(`Blocked ${userIds.length} users`);
          break;
          
        case 'unblock':
          for (const userId of userIds) {
            await supabase
              .from('members')
              .update({ status: 'published', updated_at: new Date().toISOString() })
              .eq('user_id', userId);
          }
          toast.success(`Unblocked ${userIds.length} users`);
          break;
          
        case 'archive':
          for (const userId of userIds) {
            await supabase
              .from('members')
              .update({ status: 'archived', updated_at: new Date().toISOString() })
              .eq('user_id', userId);
          }
          toast.success(`Archived ${userIds.length} users`);
          break;
          
        case 'delete':
          // Show delete modal for bulk delete
          toast.info('Please use individual delete for content management options');
          break;
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  // Handle individual user actions
  const handleUserAction = async (userId: string, action: string) => {
    const user = users?.find(u => u.user_id === userId);
    if (!user) return;
    
    try {
      switch (action) {
        case 'edit':
          setEditingUser(user);
          break;
          
        case 'block':
          await supabase
            .from('members')
            .update({ status: 'blocked', updated_at: new Date().toISOString() })
            .eq('user_id', userId);
          toast.success('User blocked');
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          break;
          
        case 'unblock':
          await supabase
            .from('members')
            .update({ status: 'published', updated_at: new Date().toISOString() })
            .eq('user_id', userId);
          toast.success('User unblocked');
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          break;
          
        case 'archive':
          await supabase
            .from('members')
            .update({ status: 'archived', updated_at: new Date().toISOString() })
            .eq('user_id', userId);
          toast.success('User archived');
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          break;
          
        case 'delete':
          setShowDeleteModal(user);
          break;
      }
    } catch (error) {
      console.error('User action error:', error);
      toast.error('Failed to perform action');
    }
    
    setShowActionDropdown(null);
  };

  // Handle user deletion with content management
  const handleDeleteUser = async () => {
    if (!showDeleteModal) return;
    
    try {
      const userId = showDeleteModal.user_id;
      
      // Handle content based on options
      if (deleteOptions.deleteContent) {
        // Delete all user content
        await supabase.from('news').delete().eq('author_id', userId);
        await supabase.from('events').delete().eq('created_by', userId);
        await supabase.from('groups').delete().eq('created_by', userId);
        await supabase.from('companies').delete().eq('created_by', userId);
        await supabase.from('resources').delete().eq('created_by', userId);
      } else if (deleteOptions.reassignTo) {
        // Reassign content to another user
        await supabase.from('news').update({ author_id: deleteOptions.reassignTo }).eq('author_id', userId);
        await supabase.from('events').update({ created_by: deleteOptions.reassignTo }).eq('created_by', userId);
        await supabase.from('groups').update({ created_by: deleteOptions.reassignTo }).eq('created_by', userId);
        await supabase.from('companies').update({ created_by: deleteOptions.reassignTo }).eq('created_by', userId);
        await supabase.from('resources').update({ created_by: deleteOptions.reassignTo }).eq('created_by', userId);
      } else if (deleteOptions.makeAnonymous) {
        // Set content as anonymous (null author)
        await supabase.from('news').update({ author_id: null }).eq('author_id', userId);
        await supabase.from('events').update({ created_by: null }).eq('created_by', userId);
        await supabase.from('groups').update({ created_by: null }).eq('created_by', userId);
        await supabase.from('companies').update({ created_by: null }).eq('created_by', userId);
        await supabase.from('resources').update({ created_by: null }).eq('created_by', userId);
      }
      
      // Delete user profile
      await supabase.from('members').delete().eq('user_id', userId);
      
      // Delete user roles using server-side function (get all roles first)
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      // Remove each role using the server function
      if (userRoles && userRoles.length > 0) {
        for (const { role } of userRoles) {
          await supabase.rpc('manage_user_roles', {
            target_user_id: userId,
            target_role: role,
            action: 'remove'
          });
        }
      }
      
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowDeleteModal(null);
      setDeleteOptions({ deleteContent: false, reassignTo: '', makeAnonymous: false });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete user');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  // CSV Export functionality
  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      // Get all users (not just current page)
      const { data: allUsersData } = await supabase.rpc('get_admin_users');
      
      if (!allUsersData) {
        toast.error('No data to export');
        return;
      }

      // Get all member profiles
      const userIds = allUsersData.map(u => u.user_id);
      const { data: memberProfiles } = await supabase
        .from('members')
        .select('*')
        .in('user_id', userIds);

      // Prepare CSV data
      const csvData = allUsersData.map(user => {
        const profile = memberProfiles?.find(p => p.user_id === user.user_id);
        return {
          user_id: user.user_id,
          email: user.email,
          name: user.name || '',
          title: profile?.title || '',
          company: profile?.company || '',
          location: profile?.location || '',
          bio: profile?.bio || '',
          status: profile?.status || 'draft',
          featured: profile?.featured ? 'Yes' : 'No',
          roles: (user.roles || []).join(';'),
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at || ''
        };
      });

      // Convert to CSV
      const headers = Object.keys(csvData[0]).join(',');
      const csvContent = [
        headers,
        ...csvData.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value
          ).join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${csvData.length} users to CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export users');
    } finally {
      setIsExporting(false);
    }
  };

  // CSV Import functionality
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file must contain headers and at least one row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setImportPreview(preview);
      setShowImportModal(true);
    };
    reader.readAsText(file);
  };

  const processImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
          try {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            // Skip if no email
            if (!row.email) continue;

            // Update/create member profile
            const memberData = {
              user_id: row.user_id || null,
              name: row.name || null,
              email: row.email,
              title: row.title || null,
              company: row.company || null,
              location: row.location || null,
              bio: row.bio || null,
              status: row.status || 'draft',
              featured: row.featured === 'Yes',
              updated_at: new Date().toISOString()
            };

            if (row.user_id) {
              // Update existing member
              const { error } = await supabase
                .from('members')
                .upsert(memberData, { onConflict: 'user_id' });
              
              if (error) throw error;

              // Handle roles if provided
              if (row.roles && canEditRoles) {
                const rolesToAssign = row.roles.split(';').filter(r => r.trim());
                if (rolesToAssign.length > 0) {
                  // Remove existing roles
                  await supabase
                    .from('user_roles')
                    .delete()
                    .eq('user_id', row.user_id);
                  
                  // Add new roles
                  const roleInserts = rolesToAssign.map(role => ({
                    user_id: row.user_id,
                    role: role.trim(),
                    created_at: new Date().toISOString()
                  }));
                  
                  await supabase
                    .from('user_roles')
                    .insert(roleInserts);
                }
              }
            }

            successCount++;
          } catch (error) {
            console.error(`Error processing row ${i}:`, error);
            errorCount++;
          }
        }

        toast.success(`Import completed: ${successCount} successful, ${errorCount} errors`);
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview([]);
      };
      reader.readAsText(importFile);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to process import');
    } finally {
      setIsImporting(false);
    }
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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">User Management
                {isSuperAdmin && <span className="text-sm font-normal text-blue-600 ml-2">(Super Admin)</span>}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {showOrphanedProfiles 
                  ? `Showing orphaned profiles (no user account) • ${users?.length || 0} profiles`
                  : `Manage user accounts, profiles, roles, and permissions • ${users?.length || 0} users shown`
                }
              </p>
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOrphanedProfiles}
                  onChange={(e) => {
                    setShowOrphanedProfiles(e.target.checked);
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Orphaned Profiles</span>
              </label>
            </div>
          </div>
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
              <div className="relative">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Bulk Actions ({selectedUsers.size})
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                {showBulkActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <button
                      onClick={() => handleBulkAction('block')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                    >
                      <Ban className="h-4 w-4 mr-2 text-orange-600" />
                      Block Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('unblock')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                    >
                      <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                      Unblock Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('archive')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                    >
                      <Archive className="h-4 w-4 mr-2 text-gray-600" />
                      Archive Selected
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => setShowBatchActionsDropdown(true)}
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
                onClick={() => refetch()}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              
              <button
                onClick={exportToCSV}
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
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
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
        <div className="w-full bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
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
                            onClick={() => setShowActionDropdown(showActionDropdown === user.user_id ? null : user.user_id)}
                            className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {showActionDropdown === user.user_id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                              <button
                                onClick={() => handleUserAction(user.user_id, 'edit')}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                              >
                                <Edit className="h-4 w-4 mr-2 text-blue-600" />
                                {user.email === 'No account' ? 'View' : 'Edit'}
                              </button>
                              {user.email !== 'No account' && (
                                <>
                                  {user.member_profile?.status !== 'blocked' ? (
                                    <button
                                      onClick={() => handleUserAction(user.user_id, 'block')}
                                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                                    >
                                      <Ban className="h-4 w-4 mr-2 text-orange-600" />
                                      Block
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUserAction(user.user_id, 'unblock')}
                                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                                    >
                                      <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                      Unblock
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleUserAction(user.user_id, 'archive')}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
                                  >
                                    <Archive className="h-4 w-4 mr-2 text-gray-600" />
                                    Archive
                                  </button>
                                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                  <button
                                    onClick={() => handleUserAction(user.user_id, 'delete')}
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
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
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
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
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
                    You are about to delete the user: <strong>{showDeleteModal.email}</strong>
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
                        onChange={() => setDeleteOptions({ deleteContent: false, reassignTo: '', makeAnonymous: false })}
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
                        onChange={() => setDeleteOptions({ deleteContent: true, reassignTo: '', makeAnonymous: false })}
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
                        onChange={() => setDeleteOptions({ deleteContent: false, reassignTo: '', makeAnonymous: true })}
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
                          onChange={() => setDeleteOptions({ deleteContent: false, reassignTo: 'select', makeAnonymous: false })}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Reassign to another user</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Transfer ownership to selected user</p>
                          {deleteOptions.reassignTo && (
                            <select
                              value={deleteOptions.reassignTo === 'select' ? '' : deleteOptions.reassignTo}
                              onChange={(e) => setDeleteOptions({ ...deleteOptions, reassignTo: e.target.value })}
                              className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                            >
                              <option value="">Select a user...</option>
                              {users?.filter(u => u.user_id !== showDeleteModal.user_id && u.email !== 'No account').map(u => (
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
                      setShowDeleteModal(null);
                      setDeleteOptions({ deleteContent: false, reassignTo: '', makeAnonymous: false });
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
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
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">Import Users from CSV</h2>
                <p className="text-green-100 text-sm mt-1">Preview and confirm import data</p>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Import Preview (First 5 rows)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Review the data below before proceeding with the import. Only users with valid user_id will be updated.
                  </p>
                  
                  {importPreview.length > 0 && (
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            {Object.keys(importPreview[0]).map(header => (
                              <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {importPreview.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, cellIndex) => (
                                <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                                  {String(value).slice(0, 50)}{String(value).length > 50 ? '...' : ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium mb-2">Important Notes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Only rows with valid user_id will update existing users</li>
                      <li>Role assignments require admin permissions</li>
                      <li>Multiple roles should be separated by semicolons (;)</li>
                      <li>Featured field accepts "Yes" or "No" values</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                      setImportPreview([]);
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processImport}
                    disabled={isImporting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Import Data'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

export default SimpleUnifiedUsersPage;