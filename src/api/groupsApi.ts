import { supabase, handleSupabaseError } from './supabaseUtils';
import {
  adaptGroupFromSupabase,
  adaptGroupToSupabase,
  adaptListFromSupabase
} from '../adapters/dataAdapters';

// TODO: Consider importing specific Supabase row types for 'data' variables
// e.g., import { Tables } from '../types/supabase';
// type GroupTableRow = Tables<'groups'>;

// Define the input type for group data passed from the application
export interface GroupInput {
  name: string;
  description: string;
  longDescription?: string | null; // Maps to Supabase 'long_description'
  heroImage: string; // Maps to Supabase 'hero_image'
  visibility: 'open' | 'closed' | 'secret' | string; // Maps to Supabase 'visibility'
  status?: string; // e.g., 'published', 'draft', maps to Supabase 'status'
  featured?: boolean | null; // maps to Supabase 'featured'
  // Note: cover_image and member_count are in Supabase schema but not handled by adaptGroupToSupabase currently.
}

export const groupsApi = {
  async getAll(filters?: { search?: string; visibility?: string[] }) {
    try {
      let query = supabase
        .from('groups')
        .select(`*`)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.visibility && filters.visibility.length > 0) {
        query = query.in('visibility', filters.visibility);
      }

      const { data, error } = await query;
      if (error) handleSupabaseError(error);
      return adaptListFromSupabase(data || [], adaptGroupFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
      // return [];
    }
  },

  async getById(id: string) {
    try {
      console.log('Fetching group with ID:', id);
      
      // First, get the basic group data without any joins
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError) {
        console.error('Error fetching group:', groupError);
        handleSupabaseError(groupError);
        return null;
      }
      
      // Then get related events in a separate query
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title, date, description, image')
        .eq('group_id', id)
        .eq('status', 'published');
        
      if (eventsError) {
        console.error('Error fetching group events:', eventsError);
        // Don't throw error, just log it
      }
      
      // Then get related resources in a separate query
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('id, title, type, url, created_at, description')
        .eq('group_id', id);
        
      if (resourcesError) {
        console.error('Error fetching group resources:', resourcesError);
        // Don't throw error, just log it
      }
      
      // Combine the data
      const combinedData = {
        ...groupData,
        events: eventsData || [],
        resources: resourcesData || []
      };
      
      console.log('Group data combined:', combinedData);
      return adaptGroupFromSupabase(combinedData);
    } catch (error) {
      console.error('Exception in getById:', error);
      handleSupabaseError(error);
      return null;
    }
  },

  async update(id: string, groupData: Partial<GroupInput>) { // Input is App-specific, adapted to Supabase Update type
    try {
      const supabaseData = adaptGroupToSupabase(groupData);
      const { data, error } = await supabase
        .from('groups')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptGroupFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
      return !error; // Return true if no error, false otherwise
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  },

  async create(groupData: GroupInput) { // Input is App-specific, adapted to Supabase Insert type
    try {
      const supabaseData = adaptGroupToSupabase(groupData);
      const { data, error } = await supabase
        .from('groups')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptGroupFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  }
};
