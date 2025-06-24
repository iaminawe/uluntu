import { supabase, handleSupabaseError, adaptItemsList } from '@/shared/api';
import {
  adaptResourceFromDatabase,
  adaptResourceToDatabase,
} from '../utils/resourceAdapter';
import { Resource, ContentStatus } from '../types'; // Ensure Resource type is imported
import { Database } from '../types/supabase'; // Ensure Database type is imported

// Define a type for the data structure returned by Supabase queries in this API
type SupabaseResourceWithJoins = Database['public']['Tables']['resources']['Row'] & {
  members?: { id: string; name: string; image?: string | null } | null;
  groups?: { id: string; name: string } | null;
  resource_tags?: Array<{ tag: string }>;
};

// Local wrapper to handle joined data after base adaptation
const mapFullResourceFromApi = (apiResource: SupabaseResourceWithJoins): Resource => {
  // Adapt the base resource fields first
  const resource = adaptResourceFromDatabase(apiResource);

  // Populate contributor name from the joined members table
  if (apiResource.members) {
    resource.contributor = {
      id: apiResource.contributor_id,
      name: apiResource.members.name || 'Unknown Contributor',
      // image: apiResource.members.image || undefined, // If Resource type needs contributor image
    };
  }

  // groupId is already mapped by adaptResourceFromDatabase if present in the base row.
  // If full group object or tags are needed on the Resource type, 
  // the Resource type in types.ts should be updated first, or handled differently by the caller.

  return resource;
};

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
  async getAll(filters?: { search?: string; types?: string[]; tags?: string[]; featured?: boolean; category?: string }): Promise<Resource[]> {
    try {
      let query = supabase
        .from('resources')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.types && filters.types.length > 0) {
        query = query.in('type', filters.types);
      }

      const { data, error } = await query;
      if (error) {
        handleSupabaseError(error, 'fetching resources');
        return [];
      }

      // Use map directly instead of adaptListFromSupabase
      // Note: Tag filtering removed due to join complexity - can be implemented separately if needed
      return (data || []).map(item => adaptResourceFromDatabase(item));
    } catch (error) {
      handleSupabaseError(error, 'fetching resources');
      return [];
    }
  },

  async getById(id: string): Promise<Resource | null> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        handleSupabaseError(error, 'fetching resource by id');
        return null;
      }
      
      return data ? adaptResourceFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'fetching resource by id');
      return null;
    }
  },

  async create(resourceData: ResourceInput): Promise<Resource | null> {
    try {
      // Convert ResourceInput to a partial Resource for the adapter
      const resourceForAdapter: Partial<Resource> = {
        title: resourceData.title,
        description: resourceData.description,
        type: resourceData.type as 'guide' | 'tool' | 'article' | 'video' | 'document' | 'link',
        url: resourceData.url,
        image: resourceData.image ?? undefined,
        status: (resourceData.status || 'draft') as ContentStatus,
        featured: resourceData.featured ?? false,
        contributor: {
          id: resourceData.contributorId,
          name: '' // Will be populated on retrieval
        },
        groupId: resourceData.groupId ?? undefined
      };

      // Get data ready for Supabase using our adapter
      const supabaseData = adaptResourceToDatabase(resourceForAdapter);
      
      const { data, error } = await supabase
        .from('resources')
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'creating resource');
        return null;
      }
      
      return data ? adaptResourceFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'creating resource');
      return null;
    }
  },

  async update(id: string, resourceData: Partial<ResourceInput>): Promise<Resource | null> {
    try {
      // Convert ResourceInput to a partial Resource for the adapter
      const resourceForAdapter: Partial<Resource> = {};
      
      if (resourceData.title !== undefined) resourceForAdapter.title = resourceData.title;
      if (resourceData.description !== undefined) resourceForAdapter.description = resourceData.description;
      if (resourceData.type !== undefined) resourceForAdapter.type = resourceData.type as 'guide' | 'tool' | 'article' | 'video' | 'document' | 'link';
      if (resourceData.url !== undefined) resourceForAdapter.url = resourceData.url;
      if (resourceData.image !== undefined) resourceForAdapter.image = resourceData.image ?? undefined;
      if (resourceData.status !== undefined) resourceForAdapter.status = resourceData.status as ContentStatus;
      if (resourceData.featured !== undefined) resourceForAdapter.featured = resourceData.featured ?? false;
      if (resourceData.contributorId !== undefined) {
        resourceForAdapter.contributor = {
          id: resourceData.contributorId,
          name: '' // Will be populated on retrieval
        };
      }
      if (resourceData.groupId !== undefined) resourceForAdapter.groupId = resourceData.groupId ?? undefined;
      
      const supabaseData = adaptResourceToDatabase(resourceForAdapter);
      const { data, error } = await supabase
        .from('resources')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'updating resource');
        return null;
      }
      
      return data ? adaptResourceFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'updating resource');
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting resource');
        return false;
      }
      return true; // Operation successful
    } catch (error) {
      handleSupabaseError(error, 'deleting resource');
      return false;
    }
  },

  async getRelated(id: string, limit: number = 3): Promise<Resource[]> {
    try {
      // Get the current resource to find related ones
      const currentResource = await this.getById(id);
      if (!currentResource) return [];

      // Find resources with similar type or tags
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .neq('id', id)
        .eq('status', 'published')
        .or(`type.eq.${currentResource.type}`)
        .limit(limit);

      if (error) {
        handleSupabaseError(error, 'fetching related resources');
        return [];
      }

      return adaptItemsList(data || [], (item: any) => adaptResourceFromDatabase(item));
    } catch (error) {
      handleSupabaseError(error, 'fetching related resources');
      return [];
    }
  }
};
