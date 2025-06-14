import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchGroups,
  fetchGroupById,
  fetchFilteredGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  setFilters,
  clearFilters,
  selectAllGroups,
  selectCurrentGroup,
  selectFilteredGroups,
  selectGroupsStatus,
  selectGroupsError,
  selectGroupsFilters,
  GroupFilters
} from '@/features/groups/store/groupsSlice';
import { GroupInput } from '@/features/groups/api/groupsApi';
import { useGroupEvents, useGroupMembers } from './useGroupQueries';

/**
 * Custom hook for accessing and manipulating the groups collection
 * @returns Object containing groups data and actions
 */
export function useGroupsRedux() {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectAllGroups);
  const status = useAppSelector(selectGroupsStatus);
  const error = useAppSelector(selectGroupsError);
  
  // If we have groups, don't show loading even if status is loading
  const isLoading = status === 'loading' && groups.length === 0;
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';
  
  // Load groups
  const loadGroups = () => {
    dispatch(fetchGroups());
  };

  return {
    groups,
    isLoading,
    isSuccess,
    isError,
    error,
    loadGroups,
    createGroup: (group: GroupInput) => dispatch(createGroup(group)),
    updateGroup: (id: string, data: Partial<GroupInput>) => dispatch(updateGroup({ id, data })),
    deleteGroup: (id: string) => dispatch(deleteGroup(id)),
  };
}

/**
 * Custom hook for working with a single group by ID
 * @param id The ID of the group to fetch
 * @returns Object containing group data and actions
 */
export function useGroupRedux(id?: string) {
  const dispatch = useAppDispatch();
  const group = useAppSelector(selectCurrentGroup);
  const status = useAppSelector(selectGroupsStatus);
  const error = useAppSelector(selectGroupsError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Get group events and members
  const { data: events = [], isLoading: eventsLoading } = useGroupEvents(id);
  const { data: members = [], isLoading: membersLoading } = useGroupMembers(id);

  // Load group if we have an ID
  useEffect(() => {
    if (id) {
      // Always fetch the group data when the ID changes
      dispatch(fetchGroupById(id));
    }
  }, [id, dispatch]);

  // Combine group data with related events and members
  const enrichedGroup = useMemo(() => {
    if (!group) return null;
    
    return {
      ...group,
      events: events || [],
      members: members || []
    };
  }, [group, events, members]);

  return {
    group: enrichedGroup,
    rawGroup: group, // Original group data without events/members
    isLoading: isLoading || eventsLoading || membersLoading,
    isSuccess,
    isError,
    error,
    refreshGroup: id ? () => dispatch(fetchGroupById(id)) : () => {},
    updateGroup: (data: Partial<GroupInput>) => id ? dispatch(updateGroup({ id, data })) : Promise.resolve(),
    deleteGroup: id ? () => dispatch(deleteGroup(id)) : () => Promise.resolve(),
  };
}

/**
 * Custom hook for working with filtered groups
 * @param initialFilters Optional initial filters to apply
 * @returns Object containing filtered groups data and filter actions
 */
export function useFilteredGroupsRedux(initialFilters?: GroupFilters) {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectFilteredGroups);
  const currentFilters = useAppSelector(selectGroupsFilters);
  const status = useAppSelector(selectGroupsStatus);
  const error = useAppSelector(selectGroupsError);
  
  // If we have groups, don't show loading even if status is loading
  const isLoading = status === 'loading' && groups.length === 0;
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';
  
  // Set initial filters if provided
  useEffect(() => {
    if (initialFilters) {
      dispatch(setFilters(initialFilters));
    }
  }, [dispatch, initialFilters]);

  // Apply filters when they change
  useEffect(() => {
    // Only dispatch if we have filters to apply
    if (Object.keys(currentFilters).length > 0) {
      dispatch(fetchFilteredGroups(currentFilters));
    }
  }, [dispatch, currentFilters]);

  // Helper for updating just certain filters without affecting others
  const updateFilters = (newFilters: Partial<GroupFilters>) => {
    dispatch(setFilters({ ...currentFilters, ...newFilters }));
  };

  // Pagination logic
  const getPaginatedGroups = useMemo(() => {
    return (page: number, itemsPerPage: number) => {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return groups.slice(startIndex, endIndex);
    };
  }, [groups]);

  return {
    groups,
    filters: currentFilters,
    isLoading,
    isSuccess,
    isError,
    error,
    updateFilters,
    setSearchTerm: (search?: string) => updateFilters({ search }),
    setVisibility: (visibility?: ('open' | 'closed' | 'secret')[]) => updateFilters({ visibility }),
    clearAllFilters: () => dispatch(clearFilters()),
    getPaginatedGroups,
    totalGroups: groups.length
  };
}
