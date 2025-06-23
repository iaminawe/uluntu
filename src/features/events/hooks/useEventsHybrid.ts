import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useQueryClient } from '@tanstack/react-query';
import {
  useEvents,
  useEventsWithFilters,
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '@/hooks/useEventQueries';
import {
  setFilters,
  clearFilters,
  updateFilters,
  selectEventsFilters,
  EventFilters
} from '../store/eventsUISlice';
import { EventInput } from '../api/eventsApi';
import { queryKeys, invalidationHelpers } from '@/config/queryClient';

/**
 * Hybrid hook for events that combines React Query for data fetching
 * with Redux for UI state management (filters, selections, etc.)
 */
export function useEventsHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const filters = useAppSelector(selectEventsFilters);
  
  
  // Use React Query for data fetching
  const hasFilters = Object.keys(filters).length > 0;
  const allEventsQuery = useEvents();
  const filteredEventsQuery = useEventsWithFilters(filters);
  
  // Choose the appropriate query based on whether we have filters
  const eventsQuery = hasFilters ? filteredEventsQuery : allEventsQuery;
  
  // Create mutation
  const createMutation = useCreateEvent();
  
  // Enhanced createEvent with better success handling
  const createEvent = useCallback(async (eventData: EventInput) => {
    try {
      const result = await createMutation.mutateAsync(eventData);
      // Invalidate related queries
      invalidationHelpers.invalidateRelatedData(queryClient, 'event', '');
      return result;
    } catch (error) {
      throw error;
    }
  }, [createMutation, queryClient]);

  // Filter actions (Redux) - memoized to prevent infinite loops
  const updateFiltersAction = useCallback((newFilters: Partial<EventFilters>) => {
    dispatch(updateFilters(newFilters));
  }, [dispatch]);

  const setSearchTerm = useCallback((search?: string) => {
    updateFiltersAction({ search });
  }, [updateFiltersAction]);

  const setTypes = useCallback((types?: ('in-person' | 'online' | 'hybrid')[]) => {
    updateFiltersAction({ types });
  }, [updateFiltersAction]);

  const setDateRange = useCallback((dateRange?: 'upcoming' | 'month' | 'three-months' | 'all') => {
    updateFiltersAction({ dateRange });
  }, [updateFiltersAction]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Pagination logic (client-side for now)
  const getPaginatedEvents = useMemo(() => {
    return (page: number, itemsPerPage: number) => {
      const events = eventsQuery.data || [];
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return events.slice(startIndex, endIndex);
    };
  }, [eventsQuery.data]);

  return {
    // Data from React Query
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
    
    // UI state from Redux
    filters,
    
    // Actions
    createEvent,
    updateFilters: updateFiltersAction,
    setSearchTerm,
    setTypes,
    setDateRange,
    clearAllFilters,
    
    // Pagination
    getPaginatedEvents,
    totalEvents: eventsQuery.data?.length || 0,
    
    // Mutation states
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}

/**
 * Hybrid hook for a single event
 */
export function useEventHybrid(id?: string) {
  const queryClient = useQueryClient();
  
  // Use React Query for data fetching
  const eventQuery = useEvent(id);
  
  // Mutations
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  // Enhanced update with better error handling
  const updateEvent = useCallback(async (data: Partial<EventInput>) => {
    if (!id) throw new Error('Event ID is required');
    
    try {
      const result = await updateMutation.mutateAsync({ id, data });
      // Invalidate related queries
      invalidationHelpers.invalidateRelatedData(queryClient, 'event', id);
      return result;
    } catch (error) {
      throw error;
    }
  }, [id, updateMutation, queryClient]);

  // Enhanced delete with better error handling
  const deleteEvent = useCallback(async () => {
    if (!id) throw new Error('Event ID is required');
    
    try {
      const result = await deleteMutation.mutateAsync(id);
      // Invalidate related queries
      invalidationHelpers.invalidateRelatedData(queryClient, 'event', '');
      return result;
    } catch (error) {
      throw error;
    }
  }, [id, deleteMutation, queryClient]);

  return {
    // Data from React Query
    event: eventQuery.data,
    isLoading: eventQuery.isLoading,
    isError: eventQuery.isError,
    error: eventQuery.error,
    refetch: eventQuery.refetch,
    
    // Actions
    updateEvent,
    deleteEvent,
    
    // Mutation states
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}