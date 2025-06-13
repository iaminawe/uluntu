import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchEvents, 
  fetchEventById, 
  fetchFilteredEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  setFilters,
  clearFilters,
  EventFilters
} from '@/features/events/store/eventsSlice';
import { Event as FrontendEvent } from '../types';
import { Database } from '../types/supabase';

export const useEventsRedux = () => {
  const dispatch = useAppDispatch();
  const { 
    events, 
    filteredEvents,
    currentEvent,
    filters, 
    status, 
    error 
  } = useAppSelector(state => state.events);

  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Dispatch actions
  const getAllEvents = useCallback(() => {
    return dispatch(fetchEvents());
  }, [dispatch]);

  const getEventById = useCallback((id: string) => {
    return dispatch(fetchEventById(id));
  }, [dispatch]);

  const getFilteredEvents = useCallback((eventFilters: EventFilters) => {
    dispatch(setFilters(eventFilters));
    return dispatch(fetchFilteredEvents(eventFilters));
  }, [dispatch]);

  const addEvent = useCallback((eventData: Database['public']['Tables']['events']['Insert']) => {
    return dispatch(createEvent(eventData));
  }, [dispatch]);

  const editEvent = useCallback((id: string, data: Partial<Database['public']['Tables']['events']['Update']>) => {
    return dispatch(updateEvent({ id, data }));
  }, [dispatch]);

  const removeEvent = useCallback((id: string) => {
    return dispatch(deleteEvent(id));
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
    return dispatch(fetchEvents());
  }, [dispatch]);

  return {
    // State
    events,
    filteredEvents,
    currentEvent,
    filters,
    status,
    error,
    isLoading,
    isSuccess,
    isError,
    
    // Actions
    getAllEvents,
    getEventById,
    getFilteredEvents,
    addEvent,
    editEvent,
    removeEvent,
    resetFilters
  };
};

// Helper hook to fetch and work with a single event
export const useEventRedux = (id?: string) => {
  const dispatch = useAppDispatch();
  const { currentEvent, status, error } = useAppSelector(state => state.events);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  const getEvent = useCallback(() => {
    if (id) {
      return dispatch(fetchEventById(id));
    }
    return Promise.resolve();
  }, [dispatch, id]);

  const updateEventData = useCallback((data: Partial<Database['public']['Tables']['events']['Update']>) => {
    if (id) {
      return dispatch(updateEvent({ id, data }));
    }
    return Promise.resolve();
  }, [dispatch, id]);

  const deleteEventById = useCallback(() => {
    if (id) {
      return dispatch(deleteEvent(id));
    }
    return Promise.resolve();
  }, [dispatch, id]);

  return {
    event: currentEvent as FrontendEvent | null,
    status,
    error,
    isLoading,
    isSuccess,
    isError,
    getEvent,
    updateEventData,
    deleteEventById
  };
};

// Helper hook for filtered events with pagination support
export const useFilteredEventsRedux = (initialFilters?: EventFilters) => {
  const dispatch = useAppDispatch();
  const { filteredEvents, filters, status, error } = useAppSelector(state => state.events);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  const applyFilters = useCallback((newFilters: EventFilters) => {
    dispatch(setFilters(newFilters));
    return dispatch(fetchFilteredEvents(newFilters));
  }, [dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
    return dispatch(fetchEvents());
  }, [dispatch]);

  // Initialize with filters if provided
  const initializeFilters = useCallback(() => {
    if (initialFilters) {
      return dispatch(fetchFilteredEvents(initialFilters));
    }
    return dispatch(fetchEvents());
  }, [dispatch, initialFilters]);

  return {
    events: filteredEvents,
    currentFilters: filters,
    status,
    error,
    isLoading,
    isSuccess,
    isError,
    applyFilters,
    clearAllFilters,
    initializeFilters
  };
};
