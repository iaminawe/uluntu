import { supabase, handleSupabaseError } from './supabaseUtils';
import { adaptEventFromDatabase, adaptEventToSupabaseInsert, adaptEventToSupabaseUpdate } from '../adapters/eventAdapter';
import { Event as FrontendEvent } from '../types'; // For typing

// Helper function to adapt a list of items
function adaptItemsList<T, R>(items: T[], adapter: (item: T) => R): R[] {
  return items.map(item => adapter(item));
}

// TODO: Consider importing specific Supabase row types for 'data' variables
// e.g., import { Tables } from '../types/supabase';
// type EventTableRow = Tables<'events'>;

// Define the input type for event data passed from the application
export interface EventInput {
  title: string;
  description: string;
  date: string; // ISO string for start date/time, maps to Supabase 'date' (which might be 'start_date')
  endDate?: string | null; // ISO string for end date/time, maps to Supabase 'end_date'
  location: string; // General location (e.g., "Nelson, BC", "Online")
  address?: string | null; // Specific street address if applicable, maps to Supabase 'address'
  image: string; // URL or path to image, maps to Supabase 'image'
  type: 'in-person' | 'online' | 'hybrid' | string; // maps to Supabase 'type'
  url?: string | null; // URL for event page or registration, maps to Supabase 'url'
  maxAttendees?: number | null; // maps to Supabase 'max_attendees'
  // currentAttendees is typically managed by backend logic, not direct input here
  organizerId: string; // ID of the member organizing, maps to Supabase 'organizer_id'
  groupId?: string | null; // Optional ID of associated group, maps to Supabase 'group_id'
  status?: string; // e.g., 'published', 'draft', 'cancelled', maps to Supabase 'status'
  featured?: boolean | null; // maps to Supabase 'featured'
  // sessions data would likely be handled separately or as a nested structure if API supports it
}

export const eventsApi = {
  async getAll(filters?: { search?: string; types?: string[]; dateRange?: string }): Promise<FrontendEvent[]> {
    try {
      console.log('Fetching all events with filters:', filters);
      
      // First, get the basic event data without including the members join
      let query = supabase
        .from('events')
        .select(`
          *,
          event_sessions(*)
        `)
        .eq('status', 'published')
        .order('date', { ascending: true });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.types && filters.types.length > 0) {
        query = query.in('type', filters.types);
      }

      // Date filtering
      const now = new Date().toISOString();
      switch (filters?.dateRange) {
        case 'upcoming':
          query = query.gte('date', now);
          break;
        case 'month': {
          const oneMonth = new Date();
          oneMonth.setMonth(oneMonth.getMonth() + 1);
          query = query.gte('date', now).lte('date', oneMonth.toISOString());
          break;
        }
        case 'three-months': {
          const threeMonths = new Date();
          threeMonths.setMonth(threeMonths.getMonth() + 3);
          query = query.gte('date', now).lte('date', threeMonths.toISOString());
          break;
        }
        default:
          // 'all' - no date filter
          break;
      }

      const { data, error } = await query;
      if (error) {
        handleSupabaseError(error, 'fetching events');
        return [];
      }
      
      // Use our helper function instead of adaptListFromSupabase
      return adaptItemsList(data || [], adaptEventFromDatabase);
    } catch (error) {
      handleSupabaseError(error, 'fetching events');
      return [];
    }
  },

  async getById(id: string): Promise<FrontendEvent | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_sessions(*),
          members!events_organizer_id_fkey(id, name, image, title),
          event_attendees(
            members(id, name, image)
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        handleSupabaseError(error, 'fetching event by id');
        return null;
      }
      
      return data ? adaptEventFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'fetching event by id');
      return null;
    }
  },

  async create(eventData: EventInput): Promise<FrontendEvent | null> {
    try {
      const preparedEventData: Parameters<typeof adaptEventToSupabaseInsert>[0] = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        endDate: eventData.endDate === null ? undefined : eventData.endDate,
        location: eventData.location,
        address: eventData.address === null ? undefined : eventData.address,
        image: eventData.image,
        type: eventData.type as FrontendEvent['type'], // Cast because EventInput['type'] is wider
        url: eventData.url === null ? undefined : eventData.url,
        organizer_id: eventData.organizerId,
        group_id: eventData.groupId === null ? undefined : eventData.groupId,
        max_attendees: eventData.maxAttendees === null ? undefined : eventData.maxAttendees,
        status: eventData.status as FrontendEvent['status'], // Cast if status types differ
        featured: eventData.featured === null ? undefined : eventData.featured,
        // current_attendees is not part of EventInput, managed by backend or specific logic
      };
      const supabaseData = adaptEventToSupabaseInsert(preparedEventData);
      const { data, error } = await supabase
        .from('events')
        .insert(supabaseData)
        .select('*, event_sessions(*), members!events_organizer_id_fkey(id, name, image, title)')
        .single();

      if (error) {
        handleSupabaseError(error, 'creating event');
        return null;
      }
      
      return data ? adaptEventFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'creating event');
      return null;
    }
  },

  async update(id: string, eventData: Partial<EventInput>): Promise<FrontendEvent | null> {
    try {
      // Map Partial<EventInput> to Partial<FrontendEvent> & { organizer_id?: string }
      const preparedEventData: Parameters<typeof adaptEventToSupabaseUpdate>[0] = {
        ...(eventData.title && { title: eventData.title }),
        ...(eventData.description && { description: eventData.description }),
        ...(eventData.date && { date: eventData.date }),
        ...(eventData.endDate !== undefined && { endDate: eventData.endDate === null ? undefined : eventData.endDate }),
        ...(eventData.location && { location: eventData.location }),
        ...(eventData.address !== undefined && { address: eventData.address === null ? undefined : eventData.address }),
        ...(eventData.image && { image: eventData.image }),
        ...(eventData.type && { type: eventData.type as FrontendEvent['type'] }),
        ...(eventData.url !== undefined && { url: eventData.url === null ? undefined : eventData.url }),
        ...(eventData.organizerId && { organizer_id: eventData.organizerId }),
        ...(eventData.groupId !== undefined && { group_id: eventData.groupId === null ? undefined : eventData.groupId }),
        ...(eventData.maxAttendees !== undefined && { max_attendees: eventData.maxAttendees === null ? undefined : eventData.maxAttendees }),
        ...(eventData.status && { status: eventData.status as FrontendEvent['status'] }),
        ...(eventData.featured !== undefined && { featured: eventData.featured === null ? undefined : eventData.featured }),
      };

      const supabaseData = adaptEventToSupabaseUpdate(preparedEventData);
      const { data, error } = await supabase
        .from('events')
        .update(supabaseData)
        .eq('id', id)
        .select('*, event_sessions(*), members!events_organizer_id_fkey(id, name, image, title)')
        .single();

      if (error) {
        handleSupabaseError(error, 'updating event');
        return null;
      }
      
      return data ? adaptEventFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'updating event');
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting event');
        return false;
      }
      return true; // Operation successful
    } catch (error) {
      handleSupabaseError(error, 'deleting event');
      return false;
    }
  },

  async registerForEvent(eventId: string, memberId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          member_id: memberId,
          status: 'registered'
        });

      if (error) {
        handleSupabaseError(error, 'registering for event');
        return false;
      }
      return true;
    } catch (error) {
      handleSupabaseError(error, 'registering for event');
      return false;
    }
  },

  async unregisterFromEvent(eventId: string, memberId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('member_id', memberId);

      if (error) {
        handleSupabaseError(error, 'unregistering from event');
        return false;
      }
      return true;
    } catch (error) {
      handleSupabaseError(error, 'unregistering from event');
      return false;
    }
  },

  async getRegistrationStatus(eventId: string, memberId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('event_id', eventId)
        .eq('member_id', memberId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        handleSupabaseError(error, 'checking registration status');
        return false;
      }
      
      return !!data; // Return true if registration exists
    } catch (error) {
      handleSupabaseError(error, 'checking registration status');
      return false;
    }
  },

  async getEventAttendees(eventId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          *,
          members(
            id,
            name,
            image,
            title,
            company
          )
        `)
        .eq('event_id', eventId)
        .eq('status', 'registered')
        .order('registered_at', { ascending: true });

      if (error) {
        handleSupabaseError(error, 'fetching event attendees');
        return [];
      }
      
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetching event attendees');
      return [];
    }
  },

  async updateAttendeeStatus(eventId: string, memberId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .update({ status })
        .eq('event_id', eventId)
        .eq('member_id', memberId);

      if (error) {
        handleSupabaseError(error, 'updating attendee status');
        return false;
      }
      return true;
    } catch (error) {
      handleSupabaseError(error, 'updating attendee status');
      return false;
    }
  }
};
