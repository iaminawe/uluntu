import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMembers,
  useMembersWithFilters,
  useMemberById,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
  type Member,
  type MemberFilters,
} from '@/hooks/useMemberQueries';
import { useMemberBySlugOrId } from '@/hooks/useMemberBySlugOrId';
import {
  setFilters,
  clearFilters,
  updateFilters,
  selectMembersFilters,
} from '../store/membersUISlice';
import { MemberInput } from '../api/membersApi';
import { queryKeys, invalidationHelpers } from '@/config/queryClient';

/**
 * Hybrid hook for members that combines React Query for data fetching
 * with Redux for UI state management (filters, selections, etc.)
 */
export function useMembersHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const filters = useAppSelector(selectMembersFilters);
  
  // Use React Query for data fetching
  const hasFilters = Object.keys(filters).length > 0;
  const allMembersQuery = useMembers();
  const filteredMembersQuery = useMembersWithFilters(filters);
  
  // Choose the appropriate query based on whether we have filters
  const membersQuery = hasFilters ? filteredMembersQuery : allMembersQuery;
  
  // Create mutation
  const createMutation = useCreateMember();
  
  // Enhanced createMember with better success handling
  const createMember = useCallback(async (memberData: MemberInput) => {
    try {
      const result = await createMutation.mutateAsync(memberData);
      // Invalidate related queries
      invalidationHelpers.invalidateMembers(queryClient);
      return result;
    } catch (error) {
      throw error;
    }
  }, [createMutation, queryClient]);

  // Filter actions (Redux) - memoized to prevent infinite loops
  const updateFiltersAction = useCallback((newFilters: Partial<MemberFilters>) => {
    dispatch(updateFilters(newFilters));
  }, [dispatch]);

  const setSearchTerm = useCallback((search?: string) => {
    updateFiltersAction({ search });
  }, [updateFiltersAction]);

  const setSkills = useCallback((skills?: string[]) => {
    updateFiltersAction({ skills });
  }, [updateFiltersAction]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Pagination logic (client-side for now)
  const getPaginatedMembers = useMemo(() => {
    return (page: number, itemsPerPage: number) => {
      const members = membersQuery.data || [];
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return members.slice(startIndex, endIndex);
    };
  }, [membersQuery.data]);

  return {
    // Data from React Query
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError,
    error: membersQuery.error,
    refetch: membersQuery.refetch,
    
    // UI state from Redux
    filters,
    
    // Actions
    createMember,
    updateFilters: updateFiltersAction,
    setSearchTerm,
    setSkills,
    clearAllFilters,
    
    // Pagination
    getPaginatedMembers,
    totalMembers: membersQuery.data?.length || 0,
    
    // Mutation states
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}

/**
 * Hybrid hook for a single member (supports both slug and ID)
 */
export function useMemberHybrid(slugOrId?: string) {
  const queryClient = useQueryClient();
  
  // Use React Query for data fetching with slug or ID support
  const memberQuery = useMemberBySlugOrId(slugOrId);
  
  // Mutations
  const updateMutation = useUpdateMember();
  const deleteMutation = useDeleteMember();

  // Enhanced update with better error handling
  const updateMember = async (data: Partial<MemberInput>) => {
    if (!memberQuery.data?.id) throw new Error('Member ID is required');
    
    try {
      const result = await updateMutation.mutateAsync({ id: memberQuery.data.id, data });
      // Invalidate related queries
      invalidationHelpers.invalidateMembers(queryClient);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Enhanced delete with better error handling
  const deleteMember = async () => {
    const memberId = memberQuery.data?.id;
    if (!memberId) throw new Error('Member ID is required');
    
    try {
      const result = await deleteMutation.mutateAsync(memberId);
      // Invalidate related queries
      invalidationHelpers.invalidateMembers(queryClient);
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    // Data from React Query
    member: memberQuery.data,
    isLoading: memberQuery.isLoading,
    isError: memberQuery.isError,
    error: memberQuery.error,
    refetch: memberQuery.refetch,
    
    // Actions
    updateMember,
    deleteMember,
    
    // Mutation states
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

/**
 * Simplified filters-only hook for components that only need filter state
 */
export function useMemberFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectMembersFilters);

  const updateFiltersAction = (newFilters: Partial<MemberFilters>) => {
    dispatch(updateFilters(newFilters));
  };

  const setSearchTerm = (search?: string) => {
    updateFiltersAction({ search });
  };

  const setSkills = (skills?: string[]) => {
    updateFiltersAction({ skills });
  };

  const clearAllFilters = () => {
    dispatch(clearFilters());
  };

  return {
    filters,
    updateFilters: updateFiltersAction,
    setSearchTerm,
    setSkills,
    clearAllFilters,
  };
}