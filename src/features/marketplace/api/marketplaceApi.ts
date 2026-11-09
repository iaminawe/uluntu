import { supabase, handleSupabaseError } from '@/shared/api';
import {
  adaptMarketplaceItemFromSupabase,
  adaptMarketplaceItemToSupabase,
  MarketplaceItemsQueryOptions
} from '@/adapters/marketplaceAdapters';
import { MarketplaceItem } from '../types';
import { ContentStatus } from '@/types/common';
import type { Database } from '@/types/supabase';
import { parseContentIdentifier } from '@/utils/contentUrlUtils';


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

type ListingRow = Database['public']['Tables']['marketplace_listings']['Row'];
type ListingUpdate = Database['public']['Tables']['marketplace_listings']['Update'];

const TABLE = 'marketplace_listings';
const SELECT_WITH_SELLER = '*, members!seller_id(id, name, image, slug)';

function adaptListing(row: unknown): MarketplaceItem {
  // `image` exists on the live table but is missing from the generated types
  const listing = row as ListingRow & {
    image?: string | null;
    members?: Database['public']['Tables']['members']['Row'];
    contact_info?: { email?: string; phone?: string } | null;
  };
  const item = adaptMarketplaceItemFromSupabase(listing);
  return {
    ...item,
    // Seller slug lets profile links use /directory/<slug> instead of the member UUID
    seller: { ...item.seller, slug: listing.members?.slug || undefined },
    image: listing.image || listing.images?.[0] || undefined,
    slug: listing.slug || undefined,
    condition: listing.condition || undefined,
    location: listing.location || undefined,
    tags: listing.tags || undefined,
    status: listing.status as ContentStatus,
    featured: listing.featured || false,
    contactEmail: listing.contact_info?.email,
    contactPhone: listing.contact_info?.phone,
    like_count: listing.like_count ?? 0,
    comment_count: listing.comment_count ?? 0,
  } as MarketplaceItem;
}

export const marketplaceApi = {
  async getAll(filters?: MarketplaceItemsQueryOptions): Promise<MarketplaceItem[]> {
    let query = supabase
      .from(TABLE)
      .select(SELECT_WITH_SELLER)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.condition && filters.condition !== 'all') {
        query = query.eq('condition', filters.condition);
      }
      if (filters.sellerId) {
        query = query.eq('seller_id', filters.sellerId);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }
    }

    const { data, error } = await query;
    if (error) handleSupabaseError(error, 'fetching marketplace items');
    return (data || []).map(adaptListing);
  },

  // Accepts either the listing UUID or its slug
  async getById(idOrSlug: string): Promise<MarketplaceItem | null> {
    if (!idOrSlug) return null;
    const { type, value } = parseContentIdentifier(idOrSlug.trim());

    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_WITH_SELLER)
      .eq(type, value)
      .maybeSingle();

    if (error) handleSupabaseError(error, 'fetching marketplace item by id');
    return data ? adaptListing(data) : null;
  },

  async getRelated(itemId: string, limit: number = 3): Promise<MarketplaceItem[]> {
    const current = await this.getById(itemId);
    if (!current) return [];

    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_WITH_SELLER)
      .eq('status', 'published')
      .neq('id', current.id)
      .eq('type', current.type)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) handleSupabaseError(error, 'fetching related marketplace items');
    return (data || []).map(adaptListing);
  },

  async create(itemData: MarketplaceItemInput): Promise<MarketplaceItem | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(adaptMarketplaceItemToSupabase({ ...itemData, status: itemData.status || 'published' }))
      .select(SELECT_WITH_SELLER)
      .single();

    if (error) handleSupabaseError(error, 'creating marketplace item');
    return data ? adaptListing(data) : null;
  },

  async update(id: string, itemData: Partial<MarketplaceItemInput>): Promise<MarketplaceItem | null> {
    const updates: ListingUpdate = {};
    if (itemData.title !== undefined) updates.title = itemData.title;
    if (itemData.description !== undefined) updates.description = itemData.description;
    if (itemData.type !== undefined) updates.type = itemData.type;
    if (itemData.price !== undefined) updates.price = itemData.price;
    if (itemData.condition !== undefined) updates.condition = itemData.condition;
    if (itemData.images !== undefined) updates.images = itemData.images;
    if (itemData.location !== undefined) updates.location = itemData.location;
    if (itemData.tags !== undefined) updates.tags = itemData.tags;
    if (itemData.status !== undefined) updates.status = itemData.status;
    if (itemData.featured !== undefined) updates.featured = itemData.featured;

    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select(SELECT_WITH_SELLER)
      .single();

    if (error) handleSupabaseError(error, 'updating marketplace item');
    return data ? adaptListing(data) : null;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error, 'deleting marketplace item');
    return true;
  }
};
