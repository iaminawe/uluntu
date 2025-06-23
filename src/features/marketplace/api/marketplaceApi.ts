import { supabase, handleSupabaseError, adaptItemsList } from '@/shared/api';
import {
  adaptMarketplaceItemFromSupabase,
  adaptMarketplaceItemToSupabase,
  MarketplaceItemsQueryOptions
} from '@/adapters/marketplaceAdapters';
import { MarketplaceItem } from '../types';
import { ContentStatus } from '@/types/common';


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
      console.log('[MarketplaceAPI] Using resources table as marketplace data source');
      
      // Use resources table instead of non-existent marketplace_listings
      let query = supabase
        .from('resources')
        .select('*')
        .eq('status', 'published');

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

      // Transform resources data to marketplace format
      const marketplaceItems: MarketplaceItem[] = (data || []).map(resource => ({
        id: resource.id,
        title: resource.title,
        description: resource.description || '',
        type: resource.type || 'service',
        price: 0, // Resources don't have prices
        condition: 'new',
        images: resource.image ? [resource.image] : [],
        location: 'Nelson, BC',
        tags: resource.tags || [],
        sellerId: resource.contributor_id || '',
        status: resource.status as ContentStatus,
        featured: resource.featured || false,
        createdAt: resource.created_at,
        updatedAt: resource.created_at
      }));
      
      console.log('[MarketplaceAPI] Transformed resources to marketplace items:', marketplaceItems.length);
      console.log('[MarketplaceAPI] First marketplace item:', marketplaceItems[0]);
      return marketplaceItems;
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
        .from('resources')
        .select('id')
        .eq('id', formattedId)
        .maybeSingle();
        
      if (checkError) {
        console.error('MarketplaceAPI: Error checking if item exists:', checkError);
      }
      
      console.log('MarketplaceAPI: Item exists check:', checkData);
      
      // Now perform the full query
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', formattedId)
        .single();

      if (error) {
        console.error('MarketplaceAPI: Error fetching item details:', error);
        handleSupabaseError(error, 'fetching marketplace item by id');
        return null;
      }
      
      console.log('MarketplaceAPI: Successfully retrieved item data:', data);
      
      // Transform resource to marketplace item format
      if (!data) return null;
      
      const marketplaceItem: MarketplaceItem = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        type: data.type || 'service',
        price: 0,
        condition: 'new',
        images: data.image ? [data.image] : [],
        location: 'Nelson, BC',
        tags: data.tags || [],
        sellerId: data.contributor_id || '',
        status: data.status as ContentStatus,
        featured: data.featured || false,
        createdAt: data.created_at,
        updatedAt: data.created_at
      };
      
      return marketplaceItem;
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
        .from('resources')
        .select('type')
        .eq('id', itemId)
        .single();

      if (!currentItem) return [];

      // Find related items
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('status', 'published')
        .neq('id', itemId)
        .eq('type', currentItem.type)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        handleSupabaseError(error, 'fetching related marketplace items');
        return [];
      }
      
      // Transform resources to marketplace items
      const marketplaceItems: MarketplaceItem[] = (data || []).map(resource => ({
        id: resource.id,
        title: resource.title,
        description: resource.description || '',
        type: resource.type || 'service',
        price: 0,
        condition: 'new',
        images: resource.image ? [resource.image] : [],
        location: 'Nelson, BC',
        tags: resource.tags || [],
        sellerId: resource.contributor_id || '',
        status: resource.status as ContentStatus,
        featured: resource.featured || false,
        createdAt: resource.created_at,
        updatedAt: resource.created_at
      }));
      
      return marketplaceItems;
    } catch (error) {
      handleSupabaseError(error, 'fetching marketplace items by seller');
      return []; // Return empty array on error
    }
  },

  async create(itemData: MarketplaceItemInput): Promise<MarketplaceItem | null> {
    try {
      // Transform marketplace item to resource format
      const resourceData = {
        title: itemData.title,
        description: itemData.description || '',
        type: itemData.type,
        url: '', // Resources require a URL field
        image: itemData.images?.[0] || '',
        status: itemData.status || 'published',
        featured: itemData.featured || false,
        contributor_id: itemData.sellerId,
        tags: itemData.tags || []
      };
      
      const { data, error } = await supabase
        .from('resources')
        .insert(resourceData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'creating marketplace item');
        return null;
      }
      
      // Transform created resource back to marketplace item
      if (!data) return null;
      
      const marketplaceItem: MarketplaceItem = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        type: data.type || 'service',
        price: 0,
        condition: 'new',
        images: data.image ? [data.image] : [],
        location: 'Nelson, BC',
        tags: data.tags || [],
        sellerId: data.contributor_id || '',
        status: data.status as ContentStatus,
        featured: data.featured || false,
        createdAt: data.created_at,
        updatedAt: data.created_at
      };
      
      return marketplaceItem;
    } catch (error) {
      handleSupabaseError(error, 'creating marketplace item');
      return null;
    }
  },

  async update(id: string, itemData: Partial<MarketplaceItemInput>): Promise<MarketplaceItem | null> {
    try {
      // Transform marketplace updates to resource format
      const resourceData: any = {};
      if (itemData.title) resourceData.title = itemData.title;
      if (itemData.description !== undefined) resourceData.description = itemData.description;
      if (itemData.type) resourceData.type = itemData.type;
      if (itemData.images) resourceData.image = itemData.images[0] || '';
      if (itemData.status) resourceData.status = itemData.status;
      if (itemData.featured !== undefined) resourceData.featured = itemData.featured;
      if (itemData.sellerId) resourceData.contributor_id = itemData.sellerId;
      if (itemData.tags) resourceData.tags = itemData.tags;
      
      const { data, error } = await supabase
        .from('resources')
        .update(resourceData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'updating marketplace item');
        return null;
      }
      
      // Transform updated resource back to marketplace item
      if (!data) return null;
      
      const marketplaceItem: MarketplaceItem = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        type: data.type || 'service',
        price: 0,
        condition: 'new',
        images: data.image ? [data.image] : [],
        location: 'Nelson, BC',
        tags: data.tags || [],
        sellerId: data.contributor_id || '',
        status: data.status as ContentStatus,
        featured: data.featured || false,
        createdAt: data.created_at,
        updatedAt: data.created_at
      };
      
      return marketplaceItem;
    } catch (error) {
      handleSupabaseError(error, 'updating marketplace item');
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
