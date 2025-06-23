import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { groupsApi } from '../api/groupsApi';
import { 
  selectGroupsFilters,
  selectSelectedGroupId,
  selectGroupsViewMode,
  selectGroupsSortBy,
  selectGroupsSortOrder,
  selectExpandedGroups,
  updateFilters,
  clearFilters,
  setSelectedGroup,
  setViewMode,
  setSortBy,
  setSortOrder,
  toggleGroupExpanded,
} from '../store/groupsUISlice';
import { Group, GroupInput } from '@/types';
import { queryKeys } from '@/config/queryClient';

export function useGroupsHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  // UI state from Redux
  const filters = useAppSelector(selectGroupsFilters);
  const selectedGroupId = useAppSelector(selectSelectedGroupId);
  const viewMode = useAppSelector(selectGroupsViewMode);
  const sortBy = useAppSelector(selectGroupsSortBy);
  const sortOrder = useAppSelector(selectGroupsSortOrder);
  const expandedGroups = useAppSelector(selectExpandedGroups);
  
  // React Query for server state
  const groupsQuery = useQuery({
    queryKey: queryKeys.groupsWithFilters(filters),
    queryFn: () => groupsApi.getFilteredGroups(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const featuredQuery = useQuery({
    queryKey: queryKeys.featuredGroups,
    queryFn: () => groupsApi.getFeaturedGroups(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Get single group
  const getGroup = (id: string) => {
    return useQuery({
      queryKey: queryKeys.group(id),
      queryFn: () => groupsApi.getGroupById(id),
      enabled: !!id,
    });
  };
  
  // Get user's groups
  const userGroupsQuery = useQuery({
    queryKey: queryKeys.userGroups,
    queryFn: () => groupsApi.getUserGroups(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Mutations
  const createGroup = useMutation({
    mutationFn: (data: GroupInput) => groupsApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
  
  const updateGroup = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GroupInput> }) => 
      groupsApi.updateGroup(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      queryClient.invalidateQueries({ queryKey: queryKeys.group(id) });
    },
  });
  
  const deleteGroup = useMutation({
    mutationFn: (id: string) => groupsApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
  
  const joinGroup = useMutation({
    mutationFn: (groupId: string) => groupsApi.joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups });
    },
  });
  
  const leaveGroup = useMutation({
    mutationFn: (groupId: string) => groupsApi.leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups });
    },
  });
  
  // UI actions
  const setSearchTerm = (search?: string) => {
    dispatch(updateFilters({ search }));
  };
  
  const setVisibilityFilter = (visibility?: 'open' | 'closed' | 'all') => {
    dispatch(updateFilters({ visibility }));
  };
  
  const setFeaturedFilter = (featured?: boolean) => {
    dispatch(updateFilters({ featured }));
  };
  
  const setMemberStatusFilter = (memberStatus?: 'member' | 'not-member' | 'all') => {
    dispatch(updateFilters({ memberStatus }));
  };
  
  const resetFilters = () => {
    dispatch(clearFilters());
  };
  
  // Sort groups
  const sortedGroups = [...(groupsQuery.data || [])].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '');
        break;
      case 'members':
        comparison = (a.member_count || 0) - (b.member_count || 0);
        break;
      case 'created':
        comparison = new Date(a.created_at || '').getTime() - 
                    new Date(b.created_at || '').getTime();
        break;
      case 'activity':
        // Use updated_at or created_at as activity indicator
        comparison = new Date(a.updated_at || a.created_at || '').getTime() - 
                    new Date(b.updated_at || b.created_at || '').getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return {
    // Data
    groups: sortedGroups,
    featuredGroups: featuredQuery.data || [],
    userGroups: userGroupsQuery.data || [],
    isLoading: groupsQuery.isLoading,
    isFeaturedLoading: featuredQuery.isLoading,
    isUserGroupsLoading: userGroupsQuery.isLoading,
    error: groupsQuery.error,
    
    // UI state
    filters,
    selectedGroupId,
    viewMode,
    sortBy,
    sortOrder,
    expandedGroups,
    
    // Actions
    setSearchTerm,
    setVisibilityFilter,
    setFeaturedFilter,
    setMemberStatusFilter,
    resetFilters,
    setSelectedGroup: (id: string | null) => dispatch(setSelectedGroup(id)),
    setViewMode: (mode: 'grid' | 'list') => dispatch(setViewMode(mode)),
    setSortBy: (by: 'name' | 'members' | 'created' | 'activity') => dispatch(setSortBy(by)),
    setSortOrder: (order: 'asc' | 'desc') => dispatch(setSortOrder(order)),
    toggleGroupExpanded: (id: string) => dispatch(toggleGroupExpanded(id)),
    
    // Queries
    getGroup,
    refetch: groupsQuery.refetch,
    
    // Mutations
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
  };
}