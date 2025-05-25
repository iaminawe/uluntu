import { supabase, handleSupabaseError } from './supabaseUtils';
import {
  adaptResourceFromSupabase,
  adaptResourceToSupabase,
  adaptListFromSupabase
} from '../adapters/dataAdapters';

// TODO: Consider importing specific Supabase row types for 'data' variables
// e.g., import { Tables } from '../types/supabase';
// type ResourceTableRow = Tables<'resources'>;

// Define the input type for resource data passed from the application
export interface ResourceInput {
  title: string;
  description: string;
  type: string; // e.g., 'article', 'video', 'tool', 'course', maps to Supabase 'type'
  url: string; // maps to Supabase 'url'
  image?: string | null; // maps to Supabase 'image'
  status?: string; // e.g., 'published', 'draft', 'pending', maps to Supabase 'status'
  featured?: boolean | null; // maps to Supabase 'featured'
  contributorId: string; // ID of the member contributing, maps to Supabase 'contributor_id'
  groupId?: string | null; // Optional ID of associated group, maps to Supabase 'group_id'
  // Tags are handled separately via the resource_tags table, not directly in resource creation/update via adaptResourceToSupabase
  // If tags are sent from the UI, they might need separate processing logic.
  tags?: string[];
}

export const resourcesApi = {
  async getAll(filters?: { search?: string; types?: string[]; tags?: string[] }) {
    try {
      let query = supabase
        .from('resources')
        .select(`
          *,
          members!resources_contributor_id_fkey(id, name),
          resource_tags(tag),
          groups(id, name)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.types && filters.types.length > 0) {
        query = query.in('type', filters.types);
      }

      const { data, error } = await query;
      if (error) handleSupabaseError(error);

      // Filter by tags if provided
      let filteredData = data || [];
      if (filters?.tags && filters.tags.length > 0) {
        filteredData = filteredData.filter(resource => 
          resource.resource_tags?.some((tagObject: { tag: string }) => 
            filters.tags!.includes(tagObject.tag)
          )
        );
      }

      return adaptListFromSupabase(filteredData, adaptResourceFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
      // return [];
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          members!resources_contributor_id_fkey(id, name, image),
          resource_tags(tag),
          groups(id, name)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptResourceFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async create(resourceData: ResourceInput) { // Input is App-specific, adapted to Supabase Insert type
    try {
      const supabaseData = adaptResourceToSupabase(resourceData);
      const { data, error } = await supabase
        .from('resources')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptResourceFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async update(id: string, resourceData: Partial<ResourceInput>) { // Input is App-specific, adapted to Supabase Update type
    try {
      const supabaseData = adaptResourceToSupabase(resourceData);
      const { data, error } = await supabase
        .from('resources')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptResourceFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('resources')
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
