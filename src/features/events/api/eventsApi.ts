import { supabase, handleSupabaseError } from '@/api/supabaseUtils';
import { adaptEventFromDatabase, adaptEventToSupabaseInsert, adaptEventToSupabaseUpdate } from '../utils/eventAdapter';
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
      console.log('[EventsAPI] Fetching all events with filters:', filters);
      console.log('[EventsAPI] Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'Not set');
      
      // First, let's do a simple test query to check if we can access the database at all
      console.log('[EventsAPI] Running test query to verify Supabase connection...');
      try {
        // Try a simple count query to check access
        const testResult = await supabase.from('events').select('count', { count: 'exact' });
        console.log('[EventsAPI] Test query result:', {
          data: testResult.data,
          count: testResult.count,
          error: testResult.error,
          errorMessage: testResult.error?.message,
          errorCode: testResult.error?.code,
          status: testResult.status,
          statusText: testResult.statusText
        });
        
        // Try to list some common tables to check permissions
        console.log('[EventsAPI] Checking table access...');
        const tablesCheck = [];
        
        // Check events table
        const eventsCheck = await supabase.from('events').select('id').limit(1);
        tablesCheck.push({ table: 'events', success: !eventsCheck.error, error: eventsCheck.error?.message });
        
        // Check members table
        const membersCheck = await supabase.from('members').select('id').limit(1);
        tablesCheck.push({ table: 'members', success: !membersCheck.error, error: membersCheck.error?.message });
        
        // Check companies table
        const companiesCheck = await supabase.from('companies').select('id').limit(1);
        tablesCheck.push({ table: 'companies', success: !companiesCheck.error, error: companiesCheck.error?.message });
        
        console.log('[EventsAPI] Table access check results:', tablesCheck);
      } catch (testError) {
        console.error('[EventsAPI] Test query failed:', testError);
      }
      
      // Now proceed with the actual query
      let query = supabase
        .from('events')
        .select(`
          *,
          event_sessions(*)
        `)
        // Temporarily remove status filter to see all events
        // .eq('status', 'published')
        .order('date', { ascending: true });

      console.log('[EventsAPI] Query built, about to execute');

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

      console.log('[EventsAPI] Executing Supabase query...', query);
      
      // Log the SQL query being executed (if available)
      if (typeof query.toSQL === 'function') {
        try {
          const sqlQuery = query.toSQL();
          console.log('[EventsAPI] SQL Query:', sqlQuery);
        } catch (e) {
          console.log('[EventsAPI] Could not get SQL query:', e);
        }
      }
      
      // Execute the query with detailed error handling
      let data, error;
      try {
        const result = await query;
        data = result.data;
        error = result.error;
        console.log('[EventsAPI] Query result:', { 
          dataLength: data?.length, 
          error, 
          data: data?.slice(0, 2),
          rawData: data
        });
      } catch (queryError) {
        console.error('[EventsAPI] Query execution error:', queryError);
        error = queryError;
      }
      
      if (error) {
        console.error('[EventsAPI] Supabase error:', error);
        handleSupabaseError(error, 'fetching events');
        return [];
      }
      
      // Log the raw data structure to understand what we're working with
      console.log('[EventsAPI] Raw data structure:', {
        firstItem: data && data.length > 0 ? Object.keys(data[0]) : 'No data',
        sampleData: data?.slice(0, 1)
      });
      
      // Ensure we have data to adapt
      if (!data || data.length === 0) {
        console.log('[EventsAPI] No data to adapt, returning empty array');
        return [];
      }
      
      // Directly adapt the data without using helper functions that might be causing issues
      const adapted = data.map(item => {
        // Create a basic event object with required fields
        const event: FrontendEvent = {
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          date: item.date || new Date().toISOString(),
          location: item.location || '',
          type: item.type || 'other',
          status: item.status || 'draft',
          featured: item.featured || false,
          image: item.image || '',
          // Add any other fields that might be needed
        };
        
        return event;
      });
      
      console.log('[EventsAPI] Adapted events:', {
        count: adapted.length,
        sample: adapted.slice(0, 2)
      });
      
      return adapted;
    } catch (error) {
      console.error('[EventsAPI] Exception caught:', error);
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
          event_sessions(*)
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
        .select('*, event_sessions(*)')
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
        .select('*, event_sessions(*)')
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
  }
};
