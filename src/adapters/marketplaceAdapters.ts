// Adapter functions for marketplace items
import { MarketplaceItem, ContentStatus } from '../types';
import { Database } from '../types/supabase';

// Marketplace listing types
export type ListingType = 'product' | 'service' | 'equipment' | 'event' | string;
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor' | 'used' | string;
export type ListingPriceRange = 'any' | 'under-50' | '50-100' | '100-500' | '500-2000' | 'over-2000';

// Local marketplace listing interface for database compatibility
export interface MarketplaceListing {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  condition: string | null;
  status: string | null;
  images: string[] | null;
  location: string | null;
  tags: string[] | null;
  type: string;
  seller_id: string | null;
  updated_at: string | null;
  created_at?: string | null;
  // Contact information fields
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_method?: string | null;
  show_contact_info?: boolean | null;
}

// Mock marketplace listing interface
export interface MockMarketplaceListing {
  id: number | string;
  title: string;
  description?: string;
  type: ListingType;
  price?: number;
  condition?: ListingCondition;
  images?: string[];
  created_at?: string;
  seller_id?: string;
  location?: string;
  tags?: string[];
  status?: string;
}

// Adapter function to convert from main MarketplaceItem type to local MarketplaceListing type
export const adaptMainMarketplaceItemToListing = (item: MarketplaceItem): Partial<MarketplaceListing> => {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    price: item.price || null,
    condition: null, // This field doesn't exist in the main type
    status: item.status || null,
    images: item.image ? [item.image] : null,
    location: null, // This field doesn't exist in the main type
    tags: item.category ? [item.category] : null,
    seller_id: item.seller?.id || null,
    updated_at: null, // This field doesn't exist in the main type
    created_at: item.datePosted || null
  };
};

// Adapter function to convert from local MarketplaceListing type to main MarketplaceItem type
export const adaptListingToMainMarketplaceItem = (listing: MarketplaceListing): Partial<MarketplaceItem> => {
  return {
    id: listing.id.toString(),
    title: listing.title,
    description: listing.description || '',
    type: listing.type as MarketplaceItem['type'],
    price: listing.price || undefined,
    category: listing.tags?.[0] || '',
    image: listing.images?.[0] || undefined,
    seller: {
      id: listing.seller_id || '0',
      name: 'Unknown Seller', // This would need to be populated from user data
      image: '' // This would need to be populated from user data
    },
    datePosted: listing.created_at || new Date().toISOString(),
    status: (listing.status as ContentStatus) || undefined
  };
};

// Adapter function to convert from main MarketplaceItem type to local MockMarketplaceListing type
export const adaptMainMarketplaceItemToMock = (item: MarketplaceItem): Partial<MockMarketplaceListing> => {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type as ListingType,
    price: item.price,
    condition: 'new', // Default value
    images: item.image ? [item.image] : undefined,
    created_at: item.datePosted,
    seller_id: item.seller?.id,
    location: '', // This field doesn't exist in the main type
    tags: [item.category],
    status: item.status
  };
};

// Adapter function to convert from local MockMarketplaceListing type to main MarketplaceItem type
export const adaptMockToMainMarketplaceItem = (mock: MockMarketplaceListing): Partial<MarketplaceItem> => {
  return {
    id: mock.id.toString(),
    title: mock.title,
    description: mock.description || '',
    type: mock.type as MarketplaceItem['type'],
    price: mock.price,
    category: mock.tags?.[0] || '',
    image: mock.images?.[0],
    seller: {
      id: mock.seller_id || '0',
      name: 'Unknown Seller', // This would need to be populated from user data
      image: '' // This would need to be populated from user data
    },
    datePosted: mock.created_at || new Date().toISOString(),
    status: (mock.status as ContentStatus) || undefined
  };
};

// Filter options interface
export interface FilterOptions {
  search: string;
  type: ListingType | 'all';
  condition: ListingCondition | 'all';
  priceRange: ListingPriceRange | 'all';
  tags: string[];
}

// Query options interface
export interface MarketplaceItemsQueryOptions {
  search?: string;
  type?: string;
  condition?: string;
  priceRange?: string;
  tags?: string[];
  sellerId?: string;
  types?: ListingType[];
}

export type MarketplaceItemsQueryKey = (string | MarketplaceItemsQueryOptions | undefined | number)[];

// Supabase-specific types and adapters
type Tables = Database['public']['Tables'];
type SupabaseMarketplaceItem = Tables['marketplace_listings']['Row'];
type SupabaseMember = Tables['members']['Row'];

// Interface for the input of adaptMarketplaceItemToSupabase
export interface MarketplaceItemFormInput {
  title?: string;
  description?: string;
  type?: ListingType;
  price?: number;
  condition?: ListingCondition;
  images?: string[];
  location?: string;
  tags?: string[];
  sellerId?: string; // UUID string for Supabase seller_id
  status?: ContentStatus;
  featured?: boolean;
  category?: string; // Optional: if used to derive tags or for other logic
  // Contact information fields
  contactEmail?: string;
  contactPhone?: string;
  contactMethod?: 'email' | 'phone' | 'both';
  showContactInfo?: boolean;
}

// Adapts from Supabase row to Frontend MarketplaceItem
export function adaptMarketplaceItemFromSupabase(
  item: SupabaseMarketplaceItem & { members?: SupabaseMember }
): MarketplaceItem { // MarketplaceItem here is from '../types'
  let sellerInfo: MarketplaceItem['seller'];

  if (item.members && item.members.id) { // Check if member and ID exist
    sellerInfo = {
      id: String(item.members.id), // Convert to string for consistency
      name: item.members.name || 'Unknown Seller',
      image: item.members.image || '/placeholder-avatar.png'
    };
  } else {
    // Fallback if no joined member or member.id is not suitable
    sellerInfo = {
      id: '0', // Use string ID for consistency
      name: 'Seller Profile Unavailable',
      image: '/placeholder-avatar.png'
    };
  }

  const itemType = (item.type && ['service', 'product', 'event'].includes(item.type))
    ? item.type as MarketplaceItem['type']
    : 'product'; // Default to 'product' or handle as error

  // Extract 'type' into a variable to use for category fallback if needed
  const itemTypeStr = item.type || 'product';
  
  return {
    id: String(item.id), // Convert to string for consistency
    title: item.title || '',
    description: item.description || '',
    type: itemType,
    price: item.price === null ? undefined : item.price,
    // Since 'category' doesn't exist on SupabaseMarketplaceItem, use type as fallback
    category: itemTypeStr, // Use type as category or default to 'other'
    image: item.images && item.images.length > 0 ? item.images[0] : '/placeholder-image.png',
    seller: sellerInfo,
    datePosted: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
  };
}

// Adapts from Form Input to Supabase Insert object
export function adaptMarketplaceItemToSupabase(
  item: MarketplaceItemFormInput
): Tables['marketplace_listings']['Insert'] {
  // Create a safe version with proper null handling
  const safeItem: Tables['marketplace_listings']['Insert'] = {
    title: item.title || '', // Ensure title is never undefined
    description: item.description || null, // Allow null but not undefined
    type: item.type || 'product', // Default to product if undefined
    price: typeof item.price === 'number' ? item.price : null, // Ensure price is number or null
    condition: item.condition || null, // Allow null but not undefined
    images: Array.isArray(item.images) ? item.images : null, // Ensure it's an array or null
    location: item.location || null, // Allow null but not undefined
    tags: Array.isArray(item.tags) ? item.tags : null, // Ensure it's an array or null
    seller_id: item.sellerId || null, // This should be the UUID string or null
    status: item.status || 'draft', // Default to draft if undefined
    featured: typeof item.featured === 'boolean' ? item.featured : false, // Ensure it's boolean
    // Contact information fields
    // 'category' is not part of the original Supabase insert data from dataAdapters.ts
    // If your Supabase table marketplace_listings has a 'category' column, add it here:
    // category: item.category || null,
  };
  
  return safeItem;
}

