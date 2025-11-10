import { supabase, handleSupabaseError } from '@/lib/supabase';
import {
  adapt[Feature]ItemFromSupabase,
  adapt[Feature]ItemToSupabase,
  [Feature]QueryOptions
} from '@/adapters/[feature]Adapters';
import { [Feature]Item } from '../types';
import { ContentStatus } from '../types/common';

/**
 * Input type for creating/updating [feature] items
 */
export interface [Feature]Input {
  title: string;
  description?: string;
  status?: ContentStatus;
  // Add other required/optional fields
}

/**
 * API service for [feature] operations
 * Handles all Supabase interactions for the [feature] module
 */
export const [feature]Api = {
  /**
   * Fetch all [feature] items with optional filters
   */
  async getAll(filters?: [Feature]QueryOptions): Promise<[Feature]Item[]> {
    try {
      console.log('[[Feature]API] getAll called with filters:', filters);
      
      let query = supabase
        .from('[feature]_table')
        .select(`
          *,
          related_table (
            id,
            name,
            image
          )
        `);

      // Apply filters
      if (filters) {
        // Search filter
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        // Status filter
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        // Type/Category filter
        if (filters.type && filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }

        // Date range filter
        if (filters.startDate) {
          query = query.gte('created_at', filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte('created_at', filters.endDate);
        }

        // Tags filter (for array columns)
        if (filters.tags && filters.tags.length > 0) {
          // For each tag, check if it's contained in the tags array
          filters.tags.forEach(tag => {
            query = query.contains('tags', [tag]);
          });
        }

        // Pagination
        if (filters.page && filters.pageSize) {
          const from = (filters.page - 1) * filters.pageSize;
          const to = from + filters.pageSize - 1;
          query = query.range(from, to);
        }

        // Sorting
        const sortColumn = filters.sortBy || 'created_at';
        const sortOrder = filters.sortOrder || 'desc';
        query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
      } else {
        // Default sorting
        query = query.order('created_at', { ascending: false });
      }

      console.log('[[Feature]API] Executing query...');
      const { data, error } = await query;
      
      if (error) {
        console.error('[[Feature]API] Supabase error:', error);
        throw handleSupabaseError(error);
      }

      const items = (data || []).map(adapt[Feature]ItemFromSupabase);
      console.log('[[Feature]API] Fetched items:', items.length);
      
      return items;
    } catch (error) {
      console.error('[[Feature]API] Error fetching items:', error);
      throw error;
    }
  },

  /**
   * Fetch a single [feature] item by ID
   */
  async getById(id: string): Promise<[Feature]Item | null> {
    try {
      console.log('[[Feature]API] getById called with ID:', id);
      
      // Validate ID
      if (!id) {
        console.error('[[Feature]API] Invalid ID provided');
        return null;
      }
      
      const { data, error } = await supabase
        .from('[feature]_table')
        .select(`
          *,
          related_table (
            id,
            name,
            image
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('[[Feature]API] Error fetching item:', error);
        handleSupabaseError(error, 'fetching [feature] item by id');
        return null;
      }
      
      console.log('[[Feature]API] Successfully retrieved item');
      return data ? adapt[Feature]ItemFromSupabase(data) : null;
    } catch (error) {
      console.error('[[Feature]API] Exception in getById:', error);
      return null;
    }
  },

  /**
   * Get related [feature] items
   */
  async getRelated(itemId: string, limit: number = 3): Promise<[Feature]Item[]> {
    try {
      console.log('[[Feature]API] getRelated called for item:', itemId);
      
      // First get the current item to find related criteria
      const { data: currentItem } = await supabase
        .from('[feature]_table')
        .select('type, tags')
        .eq('id', itemId)
        .single();

      if (!currentItem) return [];

      // Find items with similar type or tags
      let query = supabase
        .from('[feature]_table')
        .select(`
          *,
          related_table (*)
        `)
        .eq('status', 'published')
        .neq('id', itemId);

      // Match by type
      if (currentItem.type) {
        query = query.eq('type', currentItem.type);
      }

      // Or match by tags (if using array tags)
      if (currentItem.tags && currentItem.tags.length > 0) {
        query = query.overlaps('tags', currentItem.tags);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[[Feature]API] Error fetching related items:', error);
        return [];
      }
      
      return (data || []).map(adapt[Feature]ItemFromSupabase);
    } catch (error) {
      console.error('[[Feature]API] Exception in getRelated:', error);
      return [];
    }
  },

  /**
   * Create a new [feature] item
   */
  async create(itemData: [Feature]Input): Promise<[Feature]Item> {
    try {
      console.log('[[Feature]API] create called with data:', itemData);
      
      const supabaseData = adapt[Feature]ItemToSupabase(itemData);
      
      const { data, error } = await supabase
        .from('[feature]_table')
        .insert(supabaseData)
        .select(`
          *,
          related_table (*)
        `)
        .single();

      if (error) {
        console.error('[[Feature]API] Error creating item:', error);
        throw handleSupabaseError(error);
      }
      
      console.log('[[Feature]API] Successfully created item');
      return adapt[Feature]ItemFromSupabase(data);
    } catch (error) {
      console.error('[[Feature]API] Exception in create:', error);
      throw error;
    }
  },

  /**
   * Update an existing [feature] item
   */
  async update(id: string, itemData: Partial<[Feature]Input>): Promise<[Feature]Item> {
    try {
      console.log('[[Feature]API] update called for ID:', id, 'with data:', itemData);
      
      const supabaseData = adapt[Feature]ItemToSupabase(itemData);
      
      // Add updated_at timestamp
      const dataWithTimestamp = {
        ...supabaseData,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('[feature]_table')
        .update(dataWithTimestamp)
        .eq('id', id)
        .select(`
          *,
          related_table (*)
        `)
        .single();

      if (error) {
        console.error('[[Feature]API] Error updating item:', error);
        throw handleSupabaseError(error);
      }
      
      console.log('[[Feature]API] Successfully updated item');
      return adapt[Feature]ItemFromSupabase(data);
    } catch (error) {
      console.error('[[Feature]API] Exception in update:', error);
      throw error;
    }
  },

  /**
   * Delete a [feature] item
   */
  async delete(id: string): Promise<boolean> {
    try {
      console.log('[[Feature]API] delete called for ID:', id);
      
      const { error } = await supabase
        .from('[feature]_table')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[[Feature]API] Error deleting item:', error);
        handleSupabaseError(error);
        return false;
      }
      
      console.log('[[Feature]API] Successfully deleted item');
      return true;
    } catch (error) {
      console.error('[[Feature]API] Exception in delete:', error);
      return false;
    }
  },

  /**
   * Get count of [feature] items with optional filters
   */
  async getCount(filters?: [Feature]QueryOptions): Promise<number> {
    try {
      console.log('[[Feature]API] getCount called with filters:', filters);
      
      let query = supabase
        .from('[feature]_table')
        .select('id', { count: 'exact', head: true });

      // Apply same filters as getAll
      if (filters) {
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        
        // Add other filters as needed
      }

      const { count, error } = await query;

      if (error) {
        console.error('[[Feature]API] Error getting count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[[Feature]API] Exception in getCount:', error);
      return 0;
    }
  },

  /**
   * Batch update multiple [feature] items
   */
  async batchUpdate(updates: Array<{ id: string; data: Partial<[Feature]Input> }>): Promise<[Feature]Item[]> {
    try {
      console.log('[[Feature]API] batchUpdate called with', updates.length, 'items');
      
      const results = await Promise.all(
        updates.map(({ id, data }) => this.update(id, data))
      );
      
      return results;
    } catch (error) {
      console.error('[[Feature]API] Exception in batchUpdate:', error);
      throw error;
    }
  },

  /**
   * Check if a [feature] item exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('[feature]_table')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('[[Feature]API] Error checking existence:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('[[Feature]API] Exception in exists:', error);
      return false;
    }
  }
};