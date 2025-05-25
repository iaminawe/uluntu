import { supabase, handleSupabaseError } from './supabaseUtils';
import {
  adaptEventFromSupabase,
  adaptEventToSupabase,
  adaptListFromSupabase
} from '../adapters/dataAdapters';

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
  async getAll(filters?: { search?: string; types?: string[]; dateRange?: string }) {
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
      if (error) handleSupabaseError(error);
      return adaptListFromSupabase(data || [], adaptEventFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
      // return [];
    }
  },

  async getById(id: string) {
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

      if (error) handleSupabaseError(error);
      return data ? adaptEventFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async create(eventData: EventInput) { // Input is App-specific, adapted to Supabase Insert type
    try {
      const supabaseData = adaptEventToSupabase(eventData);
      const { data, error } = await supabase
        .from('events')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptEventFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async update(id: string, eventData: Partial<EventInput>) { // Input is App-specific, adapted to Supabase Update type
    try {
      const supabaseData = adaptEventToSupabase(eventData);
      const { data, error } = await supabase
        .from('events')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptEventFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
      return !error; // Return true if no error, false otherwise
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  }
};
