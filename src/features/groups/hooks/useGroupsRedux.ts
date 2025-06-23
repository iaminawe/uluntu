import { useEffect, useMemo, useRef } from 'react';
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
} from '../store/groupsSlice';
import { GroupInput } from '../api/groupsApi';
import { useGroupEvents, useGroupMembers } from '@/hooks/useGroupQueries';

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
  
  console.log('[useGroupRedux] Hook called with:', { id, group, status, error });
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Get group events and members
  const { data: events = [], isLoading: eventsLoading } = useGroupEvents(id);
  const { data: members = [], isLoading: membersLoading } = useGroupMembers(id);

  // Load group if we have an ID
  useEffect(() => {
    if (id) {
      console.log('[useGroupRedux] Fetching group with ID:', id);
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
  const allGroups = useAppSelector(selectAllGroups);
  
  // Track if we've already fetched to prevent loops
  const hasFetchedRef = useRef(false);
  const lastFiltersRef = useRef<string>('');
  
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
    // Skip if we're not using this hook actively (no initial filters means we're not filtering)
    if (!initialFilters && !currentFilters) return;
    
    // Create a string representation of current filters to detect changes
    const filterString = JSON.stringify(currentFilters || {});
    if (filterString === lastFiltersRef.current) return;
    lastFiltersRef.current = filterString;
    
    // Only fetch filtered groups if we have actual filter values
    const hasActualFilters = currentFilters && (
      currentFilters.search || 
      (currentFilters.visibility && currentFilters.visibility.length > 0)
    );
    
    if (hasActualFilters) {
      dispatch(fetchFilteredGroups(currentFilters));
    } else if (!hasFetchedRef.current && allGroups.length === 0) {
      // If no filters and we haven't fetched yet, fetch all groups once
      hasFetchedRef.current = true;
      dispatch(fetchGroups());
    }
  }, [dispatch, currentFilters, initialFilters, allGroups.length]);

  // Helper for updating just certain filters without affecting others
  const updateFilters = (newFilters: Partial<GroupFilters>) => {
    dispatch(setFilters({ ...(currentFilters || {}), ...newFilters }));
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
