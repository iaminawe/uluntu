import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { adminRolesApi } from '@/features/admin/api/roles';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { AdminUser, DeleteOptions } from '../types';

/**
 * useUserManagement - Main hook for user management operations
 * Handles:
 * - User queries and permissions
 * - User CRUD operations
 * - Role management
 * - Bulk actions
 */
export const useUserManagement = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // State management
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionRole, setBulkActionRole] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<AdminUser | null>(null);
  const [deleteOptions, setDeleteOptions] = useState<DeleteOptions>({
    deleteContent: false,
    reassignTo: '',
    makeAnonymous: false
  });
  const [showActionDropdown, setShowActionDropdown] = useState<string | null>(null);

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
  const canEditRoles = isAdmin;

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
          const { error } = await supabase
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
          const { error } = await supabase
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
  const handleSelectAll = (users: AdminUser[], checked: boolean) => {
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

  // One request for all selected members instead of one per member.
  const setMemberStatus = async (userIds: string[], status: string) => {
    const { error } = await supabase
      .from('members')
      .update({ status, updated_at: new Date().toISOString() })
      .in('user_id', userIds);
    if (error) throw error;
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, users: AdminUser[]) => {
    const userIds = Array.from(selectedUsers);

    try {
      switch (action) {
        case 'block':
          await setMemberStatus(userIds, 'blocked');
          toast.success(`Blocked ${userIds.length} users`);
          break;

        case 'unblock':
          await setMemberStatus(userIds, 'published');
          toast.success(`Unblocked ${userIds.length} users`);
          break;

        case 'archive':
          await setMemberStatus(userIds, 'archived');
          toast.success(`Archived ${userIds.length} users`);
          break;

        case 'delete':
          // Show delete modal for bulk delete
          toast('Please use individual delete for content management options', {
            icon: 'ℹ️',
          });
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
  const handleUserAction = async (userId: string, action: string, users: AdminUser[]) => {
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

      // The content tables are independent, so update them in parallel.
      // Not atomic: a failure part-way leaves some tables changed.
      const failed = (results: { error: unknown }[]) => {
        const hit = results.find(r => r.error);
        if (hit) throw hit.error;
      };
      if (deleteOptions.deleteContent) {
        // Delete all user content
        failed(await Promise.all([
          supabase.from('news').delete().eq('author_id', userId),
          supabase.from('events').delete().eq('created_by', userId),
          supabase.from('groups').delete().eq('created_by', userId),
          supabase.from('companies').delete().eq('created_by', userId),
          supabase.from('resources').delete().eq('created_by', userId),
        ]));
      } else if (deleteOptions.reassignTo) {
        // Reassign content to another user
        const to = deleteOptions.reassignTo;
        failed(await Promise.all([
          supabase.from('news').update({ author_id: to }).eq('author_id', userId),
          supabase.from('events').update({ created_by: to }).eq('created_by', userId),
          supabase.from('groups').update({ created_by: to }).eq('created_by', userId),
          supabase.from('companies').update({ created_by: to }).eq('created_by', userId),
          supabase.from('resources').update({ created_by: to }).eq('created_by', userId),
        ]));
      } else if (deleteOptions.makeAnonymous) {
        // Set content as anonymous (null author)
        failed(await Promise.all([
          supabase.from('news').update({ author_id: null }).eq('author_id', userId),
          supabase.from('events').update({ created_by: null }).eq('created_by', userId),
          supabase.from('groups').update({ created_by: null }).eq('created_by', userId),
          supabase.from('companies').update({ created_by: null }).eq('created_by', userId),
          supabase.from('resources').update({ created_by: null }).eq('created_by', userId),
        ]));
      }

      // Delete user profile
      const { error: memberError } = await supabase.from('members').delete().eq('user_id', userId);
      if (memberError) throw memberError;

      // Delete user roles using server-side function (get all roles first)
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      // Remove each role using the server function
      if (userRoles && userRoles.length > 0) {
        failed(await Promise.all(userRoles.map(({ role }) =>
          supabase.rpc('manage_user_roles', {
            target_user_id: userId,
            target_role: role,
            action: 'remove'
          })
        )));
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

  // Handle save user
  const handleSaveUser = async (userId: string, updates: any) => {
    await saveUserMutation.mutateAsync({ userId, updates });
  };

  return {
    // State
    editingUser,
    selectedUsers,
    showBulkActions,
    bulkActionRole,
    showDeleteModal,
    deleteOptions,
    showActionDropdown,
    currentUserRoles,
    isSuperAdmin,
    isAdmin,
    canEditRoles,
    roles,

    // Setters
    setEditingUser,
    setSelectedUsers,
    setShowBulkActions,
    setBulkActionRole,
    setShowDeleteModal,
    setDeleteOptions,
    setShowActionDropdown,

    // Actions
    handleUserSelect,
    handleSelectAll,
    handleBulkAssign,
    handleBulkAction,
    handleUserAction,
    handleDeleteUser,
    handleSaveUser,

    // Mutations
    saveUserMutation,
    bulkAssignRoleMutation
  };
};
