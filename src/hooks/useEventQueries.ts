import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { eventsApi, EventInput as EventsApiEventInput } from '../api/eventsApi';
import { Database } from '../types/supabase';
import mockData from '../data/mock/mockData';

// Event specific types
export interface EventFilters {
  search?: string;
  types?: ('in-person' | 'online' | 'hybrid')[];
  dateRange?: 'upcoming' | 'month' | 'three-months' | 'all';
}

// Events hooks
export function useEvents(): UseQueryResult<Database['public']['Tables']['events']['Row'][], Error> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  return useQuery<Database['public']['Tables']['events']['Row'][], Error>({
    queryKey: ['events', 'all', useSupabase ? 'supabase' : 'mock'],
    queryFn: () => {
      if (useSupabase) {
        return eventsApi.getAll();
      } else {
        return Promise.resolve(mockData.events || []);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEventsWithFilters(filters?: EventFilters): UseQueryResult<Database['public']['Tables']['events']['Row'][], Error> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  return useQuery<Database['public']['Tables']['events']['Row'][], Error>({
    queryKey: ['events', 'filters', filters, useSupabase ? 'supabase' : 'mock'],
    queryFn: () => {
      if (useSupabase) {
        return eventsApi.getAll(filters);
      } else {
        let filteredEvents = mockData.events || [];
        if (filters?.search) {
          filteredEvents = filteredEvents.filter((e: Database['public']['Tables']['events']['Row']) => 
            e.title.toLowerCase().includes(filters.search!.toLowerCase())
          );
        }
        if (filters?.types && filters.types.length > 0) {
          filteredEvents = filteredEvents.filter((e: Database['public']['Tables']['events']['Row']) => 
            filters.types!.includes(e.type as 'in-person' | 'online' | 'hybrid')
          );
        }
        if (filters?.dateRange === 'upcoming') {
          const now = new Date().toISOString();
          filteredEvents = filteredEvents.filter((e: Database['public']['Tables']['events']['Row']) => e.date >= now);
        }
        return Promise.resolve(filteredEvents);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEvent(id?: string): UseQueryResult<Database['public']['Tables']['events']['Row'] | undefined, Error> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  return useQuery<Database['public']['Tables']['events']['Row'] | undefined, Error>({
    queryKey: ['events', id, useSupabase ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!id) {
        return undefined;
      }

      if (useSupabase) {
        return eventsApi.getById(id);
      } else {
        const event = mockData.events?.find((e: Database['public']['Tables']['events']['Row']) => e.id.toString() === id) || null; // Ensure ID types match if mock ID is number
        return Promise.resolve(event as Database['public']['Tables']['events']['Row'] | null);
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEvent(): UseMutationResult<
  Database['public']['Tables']['events']['Row'] | null,
  Error,
  Database['public']['Tables']['events']['Insert'],
  unknown
> {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<Database['public']['Tables']['events']['Row'] | null, Error, Database['public']['Tables']['events']['Insert']>({
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
        const newMockEvent = {
          ...eventData,
          id: `mock_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          description: eventData.description || '',
          title: eventData.title || 'Mock Event',
          date: eventData.date || new Date().toISOString(),
          location: eventData.location || 'Mock Location',
          type: eventData.type || 'online',
          organizer_id: eventData.organizer_id || 'mock_organizer_id',
        } as Database['public']['Tables']['events']['Row'];
        // Add to mockData.events if you want to persist mock changes in memory for the session
        // mockData.events.push(newMockEvent);
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
  Database['public']['Tables']['events']['Row'] | null,
  Error,
  { id: string; data: Partial<Database['public']['Tables']['events']['Update']> },
  unknown
> {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<Database['public']['Tables']['events']['Row'] | null, Error, { id: string; data: Partial<Database['public']['Tables']['events']['Update']> }>({
    mutationFn: ({ id, data }: { id: string; data: Partial<Database['public']['Tables']['events']['Update']> }) => {
      if (useSupabase) {
        return eventsApi.update(id, data);
      } else {
        console.log('Mock updating event:', id, data);
        // const eventIndex = mockData.events?.findIndex(e => e.id.toString() === id);
        // if (eventIndex !== -1 && mockData.events) {
        //   mockData.events[eventIndex] = { ...mockData.events[eventIndex], ...data } as Database['public']['Tables']['events']['Row'];
        //   return Promise.resolve(mockData.events[eventIndex]);
        // }
        return Promise.resolve(null); // Or find and return the first item for simplicity if not managing state
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
        return Promise.resolve(); // Ensure void promise for mock
      }
      return eventsApi.delete(id); // This already returns Promise<void>
    },
    onSuccess: (_data, id) => {
      const queryPrefix = useSupabase ? 'supabase' : 'mock';
      queryClient.invalidateQueries({ queryKey: ['events', 'all', queryPrefix] });
      queryClient.invalidateQueries({ queryKey: ['events', id, queryPrefix] });
    },
  });
}
