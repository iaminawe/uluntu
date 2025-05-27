import {
  createSlice,
  createAsyncThunk,
  PayloadAction
} from '@reduxjs/toolkit';
import { eventsApi, EventInput as EventsApiEventInput } from '../../api/eventsApi';
import { events as mockEvents } from '../../data/mock/events';
import { Event as FrontendEvent } from '../../types';
import { Database } from '../../types/supabase';

export interface EventFilters {
  search?: string;
  types?: ('in-person' | 'online' | 'hybrid')[];
  dateRange?: 'upcoming' | 'month' | 'three-months' | 'all';
}

export interface EventsState {
  events: FrontendEvent[];
  currentEvent: FrontendEvent | null;
  filteredEvents: FrontendEvent[];
  filters: EventFilters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  filteredEvents: [],
  filters: {},
  status: 'idle',
  error: null
};

// Async thunks for events
export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        const events = await eventsApi.getAll();
        return events;
      } else {
        // Use mock data
        return Promise.resolve(mockEvents || []);
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch events');
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      if (!id) {
        return undefined;
      }

      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        const event = await eventsApi.getById(id);
        return event || undefined;
      } else {
        // Find in mock data
        const events = mockEvents || [];
        const event = events.find((e) => String(e.id) === id);
        return event || undefined;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch event with ID ${id}`);
    }
  }
);

export const fetchFilteredEvents = createAsyncThunk(
  'events/fetchFiltered',
  async (filters: EventFilters, { rejectWithValue }) => {
    try {
      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        const events = await eventsApi.getAll(filters);
        return events;
      } else {
        // Filter mock data
        let filteredEvents = mockEvents || [];
        
        // Apply search filter
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredEvents = filteredEvents.filter((e) =>
            (e.title || '').toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply types filter
        if (filters?.types && filters.types.length > 0) {
          filteredEvents = filteredEvents.filter((e) => {
            const eventType = e.type || '';
            return filters.types?.some(type => type === eventType) ?? false;
          });
        }
        
        // Apply date range filter
        if (filters?.dateRange === 'upcoming') {
          const now = new Date().toISOString();
          filteredEvents = filteredEvents.filter((e) => 
            e.date && e.date >= now
          );
        }
        
        return filteredEvents;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch filtered events');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/create',
  async (eventData: Database['public']['Tables']['events']['Insert'], { rejectWithValue }) => {
    try {
      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        const event = await eventsApi.create(eventData as EventsApiEventInput);
        return event;
      } else {
        // Mock creation
        console.log('Mock creating event:', eventData);
        
        // Generate a mock response with a new ID
        const newId = String(Date.now());
        const createdEvent: FrontendEvent = {
          id: newId,
          title: eventData.title || '',
          description: eventData.description || '',
          date: eventData.date || new Date().toISOString(),
          endDate: eventData.end_date || undefined,
          location: eventData.location || '',
          address: eventData.address || undefined,
          type: (eventData.type as FrontendEvent['type']) || 'in-person',
          image: eventData.image || '',
          organizer: { 
            id: eventData.organizer_id || '', 
            name: 'Mock Organizer',
            image: '' 
          },
          status: (eventData.status as FrontendEvent['status']) || 'published',
          featured: eventData.featured || false,
          url: eventData.url || undefined,
          group_id: eventData.group_id || undefined,
          max_attendees: eventData.max_attendees || undefined,
          current_attendees: 0
        };
        
        return createdEvent;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, data }: { id: string; data: Partial<Database['public']['Tables']['events']['Update']> }, { rejectWithValue }) => {
    try {
      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        const event = await eventsApi.update(id, data as EventsApiEventInput);
        return event;
      } else {
        // Mock update
        console.log('Mock updating event:', id, data);
        
        // Find existing event
        const eventIndex = mockEvents?.findIndex(e => e.id.toString() === id);
        if (eventIndex !== -1 && mockEvents && mockEvents[eventIndex]) {
          // Create updated event
          const updatedEvent: FrontendEvent = {
            ...(mockEvents[eventIndex] as FrontendEvent),
            ...(data.title && { title: data.title }),
            ...(data.description && { description: data.description }),
            ...(data.date && { date: data.date }),
            ...(data.end_date !== undefined && { endDate: data.end_date === null ? undefined : data.end_date }),
            ...(data.location && { location: data.location }),
            ...(data.address !== undefined && { address: data.address === null ? undefined : data.address }),
            ...(data.image && { image: data.image }),
            ...(data.type && { type: data.type as FrontendEvent['type'] }),
            ...(data.url !== undefined && { url: data.url === null ? undefined : data.url }),
            ...(data.organizer_id && { 
              organizer: { 
                ...(mockEvents[eventIndex] as FrontendEvent).organizer, 
                id: data.organizer_id 
              } 
            }),
            ...(data.group_id !== undefined && { group_id: data.group_id === null ? undefined : data.group_id }),
            ...(data.max_attendees !== undefined && { 
              max_attendees: data.max_attendees === null ? undefined : data.max_attendees 
            }),
            ...(data.status && { status: data.status as FrontendEvent['status'] }),
            ...(data.featured !== undefined && { featured: data.featured === null ? undefined : data.featured }),
          };
          
          return updatedEvent;
        }
        return null;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to update event with ID ${id}`);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        await eventsApi.delete(id);
        return id;
      } else {
        console.log('Mock deleting event with ID:', id);
        return id;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to delete event with ID ${id}`);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<EventFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
    clearEvents(state) {
      state.events = [];
      state.filteredEvents = [];
      state.currentEvent = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    // Handle fetchEvents
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload as FrontendEvent[];
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
    
    // Handle fetchEventById
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentEvent = action.payload as FrontendEvent;
        state.error = null;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
    
    // Handle fetchFilteredEvents
    builder
      .addCase(fetchFilteredEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFilteredEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredEvents = action.payload as FrontendEvent[];
        state.error = null;
      })
      .addCase(fetchFilteredEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
    
    // Handle createEvent
    builder
      .addCase(createEvent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.events.push(action.payload as FrontendEvent);
        }
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
    
    // Handle updateEvent
    builder
      .addCase(updateEvent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          const updatedEvent = action.payload as FrontendEvent;
          const index = state.events.findIndex(e => e.id === updatedEvent.id);
          if (index !== -1) {
            state.events[index] = updatedEvent;
          }
          // Also update currentEvent if it's the same event
          if (state.currentEvent && state.currentEvent.id === updatedEvent.id) {
            state.currentEvent = updatedEvent;
          }
          // Update in filteredEvents if present
          const filteredIndex = state.filteredEvents.findIndex(e => e.id === updatedEvent.id);
          if (filteredIndex !== -1) {
            state.filteredEvents[filteredIndex] = updatedEvent;
          }
        }
        state.error = null;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
    
    // Handle deleteEvent
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const id = action.payload as string;
        state.events = state.events.filter(e => e.id !== id);
        state.filteredEvents = state.filteredEvents.filter(e => e.id !== id);
        if (state.currentEvent && state.currentEvent.id === id) {
          state.currentEvent = null;
        }
        state.error = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, clearFilters, clearEvents } = eventsSlice.actions;

export default eventsSlice.reducer;
