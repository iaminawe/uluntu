import { supabase, handleSupabaseError, adaptItemsList } from '@/shared/api';
import {
  adaptMarketplaceItemFromSupabase,
  adaptMarketplaceItemToSupabase,
  MarketplaceItemsQueryOptions
} from '@/adapters/marketplaceAdapters';
import { MarketplaceItem } from '../types';
import { ContentStatus } from '../types/common';


// Define the input type for marketplace item data passed from the application
// Make compatible with MarketplaceItemFormInput from adapters
export interface MarketplaceItemInput {
  title: string;
  description?: string;
  type: 'product' | 'service' | 'equipment' | 'event' | string;
  price?: number;
  condition?: 'new' | 'used_like_new' | 'used_good' | 'used_fair' | string;
  images?: string[];
  location?: string;
  tags?: string[];
  sellerId: string; // ID of the member selling
  status?: ContentStatus;
  featured?: boolean;
}

export const marketplaceApi = {
  async getAll(filters?: MarketplaceItemsQueryOptions): Promise<MarketplaceItem[]> {
    try {
      console.log('[MarketplaceAPI] getAll called with filters:', filters);
      
      let query = supabase
        .from('marketplace_listings')
        .select('*');

      // Apply filters if provided
      if (filters) {
        // Add search filter if provided
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        // Add type filter if provided
        if (filters.type && filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }

        // Add condition filter if provided
        if (filters.condition && filters.condition !== 'all') {
          query = query.eq('condition', filters.condition);
        }

        // Add seller filter if provided
        if (filters.sellerId) {
          query = query.eq('seller_id', filters.sellerId);
        }

        // Add tags filter if provided
        if (filters.tags && filters.tags.length > 0) {
          // This assumes the tags column is an array type in Supabase
          // For each tag in the filters.tags array, check if it's contained in the tags column
          filters.tags.forEach(tag => {
            query = query.contains('tags', [tag]);
          });
        }
      }

      console.log('[MarketplaceAPI] Executing query...');
      const { data, error } = await query;
      console.log('[MarketplaceAPI] Query result:', { dataLength: data?.length, error });
      console.log('[MarketplaceAPI] Raw data:', data);

      if (error) {
        console.error('[MarketplaceAPI] Supabase error:', error);
        throw handleSupabaseError(error);
      }

      // Use our helper function with type assertion to avoid compatibility issues
      const adapted = adaptItemsList(data || [], (item) => adaptMarketplaceItemFromSupabase(item as any));
      console.log('[MarketplaceAPI] Adapted items:', adapted.length);
      console.log('[MarketplaceAPI] First adapted item:', adapted[0]);
      return adapted;
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<MarketplaceItem | null> {
    try {
      // Enhanced debug logging
      console.log('MarketplaceAPI: Fetching item with ID:', id, 'Type:', typeof id);
      
      // Check for valid ID format
      if (!id) {
        console.error('MarketplaceAPI: Invalid ID provided', id);
        return null;
      }
      
      // Ensure ID is properly formatted (for UUID format)
      const formattedId = id.toString().trim();
      
      console.log('MarketplaceAPI: Using formatted ID:', formattedId);
      
      // First try a basic query to see if the item exists
      const { data: checkData, error: checkError } = await supabase
        .from('marketplace_listings')
        .select('id')
        .eq('id', formattedId)
        .maybeSingle();
        
      if (checkError) {
        console.error('MarketplaceAPI: Error checking if item exists:', checkError);
      }
      
      console.log('MarketplaceAPI: Item exists check:', checkData);
      
      // Now perform the full query
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', formattedId)
        .single();

      if (error) {
        console.error('MarketplaceAPI: Error fetching item details:', error);
        handleSupabaseError(error, 'fetching marketplace item by id');
        return null;
      }
      
      console.log('MarketplaceAPI: Successfully retrieved item data:', data);
      
      // Use type assertion to avoid type compatibility issues
      return data ? adaptMarketplaceItemFromSupabase(data as unknown) : null;
    } catch (error) {
      console.error('MarketplaceAPI: Exception in getById:', error);
      handleSupabaseError(error, 'fetching marketplace item by id');
      return null;
    }
  },

  async getRelated(itemId: string, limit: number = 3): Promise<MarketplaceItem[]> {
    try {
      // Get current item details
      const { data: currentItem } = await supabase
        .from('marketplace_listings')
        .select('type')
        .eq('id', itemId)
        .single();

      if (!currentItem) return [];

      // Find related items
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('status', 'published')
        .neq('id', itemId)
        .eq('type', currentItem.type)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        handleSupabaseError(error, 'fetching marketplace items by seller');
        return [];
      }
      
      // Use our helper function instead of adaptListFromSupabase
      return adaptItemsList(data || [], (item) => adaptMarketplaceItemFromSupabase(item as unknown));
    } catch (error) {
      handleSupabaseError(error, 'fetching marketplace items by seller');
      return []; // Return empty array on error
    }
  },

  async create(itemData: MarketplaceItemInput): Promise<MarketplaceItem | null> {
    try {
      const supabaseData = adaptMarketplaceItemToSupabase(itemData);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'creating marketplace item');
        return null;
      }
      
      return data ? adaptMarketplaceItemFromSupabase(data as unknown) : null;
    } catch (error) {
      handleSupabaseError(error, 'creating marketplace item');
      return null;
    }
  },

  async update(id: string, itemData: Partial<MarketplaceItemInput>): Promise<MarketplaceItem | null> {
    try {
      const supabaseData = adaptMarketplaceItemToSupabase(itemData);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'updating marketplace item');
        return null;
      }
      
      return data ? adaptMarketplaceItemFromSupabase(data as unknown) : null;
    } catch (error) {
      handleSupabaseError(error, 'updating marketplace item');
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting marketplace item');
        return false;
      }
      return true; // Operation was successful
    } catch (error) {
      handleSupabaseError(error, 'deleting marketplace item');
      return false;
    }
  }
};
