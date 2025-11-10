import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { AdminUser } from '../types';

/**
 * useUserFilters - Hook for user filtering and pagination
 * Handles:
 * - Search functionality
 * - Role filtering
 * - Orphaned profiles toggle
 * - Pagination
 * - User data fetching
 */
export const useUserFilters = (isAdmin: boolean) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showOrphanedProfiles, setShowOrphanedProfiles] = useState(false);

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

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  return {
    // State
    searchTerm,
    selectedRole,
    currentPage,
    pageSize,
    showOrphanedProfiles,
    users,
    isLoading,

    // Setters
    setSearchTerm,
    setSelectedRole,
    setCurrentPage,
    setPageSize,
    setShowOrphanedProfiles,

    // Actions
    refetch,
    formatDate
  };
};
