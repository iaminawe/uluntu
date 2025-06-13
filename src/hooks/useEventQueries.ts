import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { eventsApi, EventInput as EventsApiEventInput } from '../api/eventsApi';
import { Database } from '../types/supabase';
import { Event as FrontendEvent } from '../types'; // Renamed to avoid conflict with mock Event
import { events as mockEvents, Event as MockEvent } from '../data/mock/events';

// Event specific types
export interface EventFilters {
  search?: string;
  types?: ('in-person' | 'online' | 'hybrid')[];
  dateRange?: 'upcoming' | 'month' | 'three-months' | 'all';
}

// Events hooks
export function useEvents(): UseQueryResult<FrontendEvent[], Error> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  return useQuery<FrontendEvent[], Error>({
    queryKey: ['events', 'all', useSupabase ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (useSupabase) {
        // Use non-null assertion as we know the API will always return an array (even if empty)
        const events = await eventsApi.getAll();
        return events as FrontendEvent[];
      } else {
        // Ensure we have a valid array, even if mockEvents is undefined
        return Promise.resolve((mockEvents || []) as FrontendEvent[]);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEventsWithFilters(filters?: EventFilters): UseQueryResult<FrontendEvent[], Error> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  return useQuery<FrontendEvent[], Error>({
    queryKey: ['events', 'filters', filters, useSupabase ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (useSupabase) {
        const events = await eventsApi.getAll(filters);
        return events as FrontendEvent[];
      } else {
        // Ensure we have a valid array, even if mockEvents is undefined
        let filteredEvents = mockEvents || [];
        
        // Apply search filter
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredEvents = filteredEvents.filter((e: MockEvent) =>
            (e.title || '').toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply types filter
        if (filters?.types && filters.types.length > 0) {
          filteredEvents = filteredEvents.filter((e: MockEvent) => {
            // Safely handle type field with validation
            const eventType = e.type || '';
            // Check if the event type is included in the filter types
            // Use optional chaining and nullish coalescing to safely access filters.types
            return filters.types?.some(type => type === eventType) ?? false;
          });
        }
        
        // Apply date range filter
        if (filters?.dateRange === 'upcoming') {
          const now = new Date().toISOString();
          filteredEvents = filteredEvents.filter((e: MockEvent) => 
            // Safely handle date comparison
            e.date && e.date >= now
          );
        }
        
        return Promise.resolve(filteredEvents as FrontendEvent[]);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEvent(id?: string): UseQueryResult<FrontendEvent | undefined, Error> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  return useQuery<FrontendEvent | undefined, Error>({
    queryKey: ['events', id, useSupabase ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!id) {
        return undefined;
      }

      if (useSupabase) {
        try {
          const event = await eventsApi.getById(id);
          return event || undefined;
        } catch (error) {
          console.error(`Error fetching event with ID ${id}:`, error);
          throw error;
        }
      } else {
        // Safely find event in mock data
        const events = mockEvents || [];
        const event = events.find((e: MockEvent) => String(e.id) === id);
        return event ? (event as FrontendEvent) : undefined;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEvent(): UseMutationResult<
  FrontendEvent | null,
  Error,
  Database['public']['Tables']['events']['Insert'], // Input to mutationFn is still Supabase Insert type
  unknown
> {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<FrontendEvent | null, Error, Database['public']['Tables']['events']['Insert']>({
    mutationFn: (eventData: Database['public']['Tables']['events']['Insert']) => {
      if (useSupabase) {
        const apiEventData: EventsApiEventInput = {
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          location: eventData.location,
          image: eventData.image,
          type: eventData.type as 'in-person' | 'online' | 'hybrid' | string,
          organizerId: eventData.organizer_id,
          ...(eventData.end_date !== undefined && { endDate: eventData.end_date }),
          ...(eventData.address !== undefined && { address: eventData.address }),
          ...(eventData.url !== undefined && { url: eventData.url }),
          ...(eventData.max_attendees !== undefined && { maxAttendees: eventData.max_attendees }),
          ...(eventData.group_id !== undefined && { groupId: eventData.group_id }),
          ...(eventData.status !== undefined && { status: eventData.status }),
          ...(eventData.featured !== undefined && { featured: eventData.featured }),
        };
        return eventsApi.create(apiEventData);
      } else {
        console.log('Mock creating event:', eventData);
        const newMockEvent: FrontendEvent = {
          // Map fields from eventData (Supabase Insert type) to FrontendEvent
          id: `mock_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          title: eventData.title || 'Mock Event',
          date: eventData.date || new Date().toISOString(),
          description: eventData.description || '',
          location: eventData.location || 'Mock Location',
          image: eventData.image || '', // Assuming image is a string, adjust if needed
          type: (eventData.type as FrontendEvent['type']) || 'online',
          organizer: { id: eventData.organizer_id || 'mock_organizer_id', name: 'Mock Organizer', image: '' }, // Mock organizer details
          // Optional fields - map if present in eventData or provide defaults
          endDate: eventData.end_date === null ? undefined : eventData.end_date,
          address: eventData.address === null ? undefined : eventData.address,
          latitude: undefined, // Or some mock value
          longitude: undefined, // Or some mock value
          max_attendees: eventData.max_attendees === null ? undefined : eventData.max_attendees,
          url: eventData.url === null ? undefined : eventData.url,
          group_id: eventData.group_id === null ? undefined : eventData.group_id,
          status: (eventData.status as FrontendEvent['status']) || 'published',
          featured: eventData.featured === null ? undefined : eventData.featured,
          // sessions and attendees would typically be empty or mocked for a new event
          sessions: [],
          attendees: 0,
        };
        // mockEvents.push(newMockEvent); // If you have a mutable mockEvents array
        return Promise.resolve(newMockEvent);
      }
    },
    onSuccess: (data) => {
      const queryPrefix = useSupabase ? 'supabase' : 'mock';
      queryClient.invalidateQueries({ queryKey: ['events', 'all', queryPrefix] });
      if (data && data.id) {
        queryClient.setQueryData(['events', data.id, queryPrefix], data);
      }
    },
  });
}

export function useUpdateEvent(): UseMutationResult<
  FrontendEvent | null,
  Error,
  { id: string; data: Partial<Database['public']['Tables']['events']['Update']> }, // Input to mutationFn is still Supabase Update type
  unknown
> {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<FrontendEvent | null, Error, { id: string; data: Partial<Database['public']['Tables']['events']['Update']> }>({
    mutationFn: ({ id, data }: { id: string; data: Partial<Database['public']['Tables']['events']['Update']> }) => {
      if (useSupabase) {
        return eventsApi.update(id, data as EventsApiEventInput); // Cast because eventsApi.update expects Partial<EventInput>
      } else {
        console.log('Mock updating event:', id, data);
        const eventIndex = mockEvents?.findIndex(e => e.id.toString() === id);
        if (eventIndex !== -1 && mockEvents && mockEvents[eventIndex]) {
          // Create a new object for the updated event to ensure type compatibility
          const updatedMockEvent: FrontendEvent = {
            ...(mockEvents[eventIndex] as FrontendEvent), // Start with existing FrontendEvent fields
            ...(data.title && { title: data.title }),
            ...(data.description && { description: data.description }),
            ...(data.date && { date: data.date }),
            ...(data.end_date !== undefined && { endDate: data.end_date === null ? undefined : data.end_date }),
            ...(data.location && { location: data.location }),
            ...(data.address !== undefined && { address: data.address === null ? undefined : data.address }),
            ...(data.image && { image: data.image }),
            ...(data.type && { type: data.type as FrontendEvent['type'] }),
            ...(data.url !== undefined && { url: data.url === null ? undefined : data.url }),
            ...(data.organizer_id && { organizer: { ...(mockEvents[eventIndex] as FrontendEvent).organizer, id: data.organizer_id } }),
            ...(data.group_id !== undefined && { group_id: data.group_id === null ? undefined : data.group_id }),
            ...(data.max_attendees !== undefined && { max_attendees: data.max_attendees === null ? undefined : data.max_attendees }),
            ...(data.status && { status: data.status as FrontendEvent['status'] }),
            ...(data.featured !== undefined && { featured: data.featured === null ? undefined : data.featured }),
          };
          // mockEvents[eventIndex] = updatedMockEvent; // If mutable
          return Promise.resolve(updatedMockEvent);
        }
        return Promise.resolve(null);
      }
    },
    onSuccess: (_data, variables) => {
      const queryPrefix = useSupabase ? 'supabase' : 'mock';
      queryClient.invalidateQueries({ queryKey: ['events', 'all', queryPrefix] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.id, queryPrefix] });
    },
  });
}

export function useDeleteEvent(): UseMutationResult<
  void, 
  Error,
  string // ID
> {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<void, Error, string>({
    mutationFn: async (id: string): Promise<void> => {
      if (!useSupabase) {
        console.log('Mock: Deleting event with id:', id);
        // const index = mockData.events.findIndex((e: Database['public']['Tables']['events']['Row']) => e.id.toString() === id);
        // if (index > -1 && mockData.events) {
        //   mockData.events.splice(index, 1);
        // }
        // Must return Promise<void>, not Promise<boolean>
        return Promise.resolve();
      }
      // Call the API and make sure to return void
      await eventsApi.delete(id);
      return Promise.resolve();
    },
    onSuccess: (_data, id) => {
      const queryPrefix = useSupabase ? 'supabase' : 'mock';
      queryClient.invalidateQueries({ queryKey: ['events', 'all', queryPrefix] });
      queryClient.invalidateQueries({ queryKey: ['events', id, queryPrefix] });
    },
  });
}

// Event registration hooks
export function useEventRegistrationStatus(eventId?: string, memberId?: string): UseQueryResult<boolean, Error> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  
  return useQuery<boolean, Error>({
    queryKey: ['event-registration', eventId, memberId, useSupabase ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!eventId || !memberId) {
        return false;
      }

      if (useSupabase) {
        return await eventsApi.getRegistrationStatus(eventId, memberId);
      } else {
        // Mock registration status - always return false for simplicity
        return false;
      }
    },
    enabled: !!eventId && !!memberId,
    staleTime: 30 * 1000, // 30 seconds - fresher data for registration status
  });
}

export function useRegisterForEvent(): UseMutationResult<
  boolean,
  Error,
  { eventId: string; memberId: string }
> {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<boolean, Error, { eventId: string; memberId: string }>({
    mutationFn: async ({ eventId, memberId }) => {
      if (useSupabase) {
        return await eventsApi.registerForEvent(eventId, memberId);
      } else {
        console.log('Mock: Registering for event', eventId, 'with member', memberId);
        return true; // Mock success
      }
    },
    onSuccess: (_data, { eventId, memberId }) => {
      const queryPrefix = useSupabase ? 'supabase' : 'mock';
      // Invalidate registration status query
      queryClient.invalidateQueries({ 
        queryKey: ['event-registration', eventId, memberId, queryPrefix] 
      });
      // Invalidate event data to update attendee count
      queryClient.invalidateQueries({ 
        queryKey: ['events', eventId, queryPrefix] 
      });
      // Invalidate events list to update attendee counts
      queryClient.invalidateQueries({ 
        queryKey: ['events', 'all', queryPrefix] 
      });
    },
  });
}

export function useUnregisterFromEvent(): UseMutationResult<
  boolean,
  Error,
  { eventId: string; memberId: string }
> {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<boolean, Error, { eventId: string; memberId: string }>({
    mutationFn: async ({ eventId, memberId }) => {
      if (useSupabase) {
        return await eventsApi.unregisterFromEvent(eventId, memberId);
      } else {
        console.log('Mock: Unregistering from event', eventId, 'with member', memberId);
        return true; // Mock success
      }
    },
    onSuccess: (_data, { eventId, memberId }) => {
      const queryPrefix = useSupabase ? 'supabase' : 'mock';
      // Invalidate registration status query
      queryClient.invalidateQueries({ 
        queryKey: ['event-registration', eventId, memberId, queryPrefix] 
      });
      // Invalidate event data to update attendee count
      queryClient.invalidateQueries({ 
        queryKey: ['events', eventId, queryPrefix] 
      });
      // Invalidate events list to update attendee counts
      queryClient.invalidateQueries({ 
        queryKey: ['events', 'all', queryPrefix] 
      });
      // Invalidate attendees list
      queryClient.invalidateQueries({ 
        queryKey: ['event-attendees', eventId, queryPrefix] 
      });
    },
  });
}

// Event attendee management hooks
export function useEventAttendees(eventId?: string): UseQueryResult<any[], Error> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  
  return useQuery<any[], Error>({
    queryKey: ['event-attendees', eventId, useSupabase ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!eventId) {
        return [];
      }

      if (useSupabase) {
        return await eventsApi.getEventAttendees(eventId);
      } else {
        // Mock attendees data
        return [
          {
            event_id: eventId,
            member_id: 'mock-member-1',
            registered_at: new Date().toISOString(),
            status: 'registered',
            members: {
              id: 'mock-member-1',
              name: 'John Doe',
              image: '',
              title: 'Software Developer',
              company: 'Tech Corp'
            }
          },
          {
            event_id: eventId,
            member_id: 'mock-member-2',
            registered_at: new Date().toISOString(),
            status: 'registered',
            members: {
              id: 'mock-member-2',
              name: 'Jane Smith',
              image: '',
              title: 'Product Manager',
              company: 'Innovation Inc'
            }
          }
        ];
      }
    },
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes - reasonably fresh for attendee data
  });
}

export function useUpdateAttendeeStatus(): UseMutationResult<
  boolean,
  Error,
  { eventId: string; memberId: string; status: string }
> {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<boolean, Error, { eventId: string; memberId: string; status: string }>({
    mutationFn: async ({ eventId, memberId, status }) => {
      if (useSupabase) {
        return await eventsApi.updateAttendeeStatus(eventId, memberId, status);
      } else {
        console.log('Mock: Updating attendee status', { eventId, memberId, status });
        return true; // Mock success
      }
    },
    onSuccess: (_data, { eventId, memberId }) => {
      const queryPrefix = useSupabase ? 'supabase' : 'mock';
      // Invalidate attendees list
      queryClient.invalidateQueries({ 
        queryKey: ['event-attendees', eventId, queryPrefix] 
      });
      // Invalidate registration status if it's the current user
      queryClient.invalidateQueries({ 
        queryKey: ['event-registration', eventId, memberId, queryPrefix] 
      });
      // Invalidate event data to update attendee count
      queryClient.invalidateQueries({ 
        queryKey: ['events', eventId, queryPrefix] 
      });
    },
  });
}
