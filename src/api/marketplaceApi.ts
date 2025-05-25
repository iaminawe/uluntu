import { supabase, handleSupabaseError } from './supabaseUtils';
import {
  adaptMarketplaceItemFromSupabase,
  adaptMarketplaceItemToSupabase,
  adaptListFromSupabase
} from '../adapters/dataAdapters';

// TODO: Consider importing specific Supabase row types for 'data' variables
// e.g., import { Tables } from '../types/supabase';
// type MarketplaceTableRow = Tables<'marketplace_listings'>;

// Define the input type for marketplace item data passed from the application
export interface MarketplaceItemInput {
  title: string;
  description?: string | null;
  type: 'product' | 'service' | 'equipment' | 'event' | string; // maps to Supabase 'type'
  price?: number | null; // maps to Supabase 'price'
  condition?: 'new' | 'used_like_new' | 'used_good' | 'used_fair' | string | null; // maps to Supabase 'condition'
  images?: string[] | null; // Array of image URLs, maps to Supabase 'images'
  location?: string | null; // maps to Supabase 'location'
  tags?: string[] | null; // Array of tags, maps to Supabase 'tags'
  sellerId: string; // ID of the member selling, maps to Supabase 'seller_id'
  status?: string; // e.g., 'published', 'draft', 'sold', maps to Supabase 'status'
  featured?: boolean | null; // maps to Supabase 'featured'
}

export const marketplaceApi = {
  async getAll(filters?: { search?: string; types?: string[] }) {
    try {
      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          members!marketplace_listings_seller_id_fkey(id, name, image)
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
      return adaptListFromSupabase(data || [], adaptMarketplaceItemFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
      // return [];
    }
  },

  async getById(id: string) {
    try {
      console.log('Fetching marketplace item with ID:', id);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          members!marketplace_listings_seller_id_fkey(id, name, image)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching marketplace item:', error);
        handleSupabaseError(error);
        return null;
      }
      
      console.log('Marketplace item data:', data);
      return data ? adaptMarketplaceItemFromSupabase(data) : null;
    } catch (error) {
      console.error('Exception in getById:', error);
      handleSupabaseError(error);
      return null;
    }
  },

  async getRelated(itemId: string, limit: number = 3) {
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
        .select(`
          *,
          members!marketplace_listings_seller_id_fkey(id, name, image)
        `)
        .eq('status', 'published')
        .neq('id', itemId)
        .eq('type', currentItem.type)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) handleSupabaseError(error);
      return adaptListFromSupabase(data || [], adaptMarketplaceItemFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
      // return [];
    }
  },

  async create(itemData: MarketplaceItemInput) { // Input is App-specific, adapted to Supabase Insert type
    try {
      const supabaseData = adaptMarketplaceItemToSupabase(itemData);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptMarketplaceItemFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async update(id: string, itemData: Partial<MarketplaceItemInput>) { // Input is App-specific, adapted to Supabase Update type
    try {
      const supabaseData = adaptMarketplaceItemToSupabase(itemData);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptMarketplaceItemFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
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
