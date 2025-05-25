import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { marketplaceApi, MarketplaceItemInput } from '../api/marketplaceApi';
import { Database } from '../types/supabase';
import mockData, { MarketplaceItem as MockMarketplaceItemType, EntityStatus } from '../data/mock/mockData'; // For mock data and its type
// Using adaptMarketplaceItemToSupabase from dataAdapters, if mapMockMarketplaceItemToSupabaseListing is different, we might need to merge or choose.
// For now, assuming adaptMarketplaceItemToSupabase is the preferred one.
// If mapMockMarketplaceItemToSupabaseListing from useSupabaseQueries.ts is needed, it should be defined here.

// Let's define mapMockMarketplaceItemToSupabaseListing here, taken from useSupabaseQueries.ts
// to ensure consistency if it's used by mock logic.
function mapMockMarketplaceItemToSupabaseListing(mockItem: MockMarketplaceItemType): MarketplaceListing {
  return {
    id: String(mockItem.id),
    created_at: mockItem.datePosted, // Assuming datePosted is in ISO format
    updated_at: mockItem.datePosted, // Or new Date().toISOString() for a more accurate updated_at for mock
    seller_id: String(mockItem.seller.id), // Assuming seller.id is number
    title: mockItem.title,
    description: mockItem.description, // MockMarketplaceItemType.description is string
    price: mockItem.price ?? null,
    condition: null, // Mock data doesn't have 'condition', defaulting to null
    status: mockItem.status as string, // Assuming EntityStatus is string-compatible
    images: mockItem.image ? [mockItem.image] : [], // Supabase expects string[]
    location: null, // Mock data doesn't have 'location'
    featured: mockItem.featured ?? false,
    tags: [], // Mock data doesn't have 'tags'
    type: mockItem.type as MarketplaceListing['type'], // Ensure compatibility
    // view_count removed as it's not in MarketplaceListing type based on TS errors
  };
}


// Environment variable to switch between Supabase and mock data
const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

// Define the structure for a marketplace listing as it comes from Supabase
export type MarketplaceListing = Database['public']['Tables']['marketplace_listings']['Row'];

// Type definitions from useSupabaseQueries.ts (ensure these are consistent or merged)
export type MarketplaceListingInput = Database['public']['Tables']['marketplace_listings']['Insert'];
export type MarketplaceListingUpdateInput = Database['public']['Tables']['marketplace_listings']['Update'];


export interface MarketplaceItemsQueryOptions {
  search?: string;
  type?: string; // This corresponds to MarketplaceListing['type']
  condition?: string;
  priceRange?: string;
  tags?: string[];
  sellerId?: string; // seller_id in DB is string (uuid)
  types?: MarketplaceListing['type'][]; // Array of specific types
}

// Adjusted MarketplaceItemsQueryKey to be more flexible for different query patterns
export type MarketplaceItemsQueryKey = (string | MarketplaceItemsQueryOptions | undefined | number)[];


const mockMarketplaceItems: MockMarketplaceItemType[] = mockData.marketplaceItems;

// Hooks

export function useMarketplaceItemsWithFilters(filters?: MarketplaceItemsQueryOptions): UseQueryResult<MarketplaceListing[], Error> {
  const queryKey: MarketplaceItemsQueryKey = ['marketplaceListings', 'filters', filters];
  return useQuery<MarketplaceListing[], Error>({
    queryKey: queryKey,
    queryFn: async (): Promise<MarketplaceListing[]> => {
      if (useSupabase) {
        // Pass filters directly, assuming marketplaceApi.getAll handles MarketplaceItemsQueryOptions | undefined
        return marketplaceApi.getAll(filters);
      } else {
        let listings: MarketplaceListing[] = mockMarketplaceItems.map(mapMockMarketplaceItemToSupabaseListing);
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          listings = listings.filter(
            (listing) => (listing.title?.toLowerCase().includes(searchTerm) || listing.description?.toLowerCase().includes(searchTerm))
          );
        }
        if (filters?.types && filters.types.length > 0) {
          listings = listings.filter((listing) => listing.type && filters.types?.includes(listing.type));
        }
        if (filters?.condition && filters.condition !== 'all') {
          listings = listings.filter((listing) => listing.condition === filters.condition);
        }
        if (filters?.priceRange) {
          listings = listings.filter((listing) => {
            if (!filters.priceRange || !listing.price) return false;
            const [min, max] = filters.priceRange.split('-').map(Number);
            return listing.price >= min && listing.price <= max;
          });
        }
        if (filters?.tags && filters.tags.length > 0) {
            listings = listings.filter(item => item.tags && filters.tags?.every(tag => item.tags!.includes(tag)));
        }
        if (filters?.sellerId) {
            listings = listings.filter(item => item.seller_id === filters.sellerId);
        }
        return listings;
      }
    },
    enabled: true
  });
}

export function useMarketplaceItems(): UseQueryResult<MarketplaceListing[], Error> {
  return useQuery<MarketplaceListing[], Error>({
    queryKey: ['marketplaceItems', useSupabase ? 'supabase' : 'mock'],
    queryFn: async (): Promise<MarketplaceListing[]> => {
      if (!useSupabase) {
        return mockMarketplaceItems.map(mapMockMarketplaceItemToSupabaseListing);
      }
      return marketplaceApi.getAll();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketplaceItem(id: string | undefined): UseQueryResult<MarketplaceListing | undefined, Error> {
  const queryKey: MarketplaceItemsQueryKey = ['marketplaceItem', id, useSupabase ? 'supabase' : 'mock'];
  return useQuery<MarketplaceListing | undefined, Error>({
    queryKey: queryKey,
    queryFn: async (): Promise<MarketplaceListing | undefined> => {
      if (!id) return undefined;
      if (useSupabase) {
        return marketplaceApi.getById(id);
      } else {
        const mockItem = mockMarketplaceItems.find((item) => String(item.id) === id);
        return mockItem ? mapMockMarketplaceItemToSupabaseListing(mockItem) : undefined;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRelatedMarketplaceItems(itemId?: string, limit: number = 3): UseQueryResult<MarketplaceListing[], Error> {
  const queryKey: MarketplaceItemsQueryKey = ['marketplaceListings', 'related', itemId, limit, useSupabase ? 'supabase' : 'mock'];
  return useQuery<MarketplaceListing[], Error>({
    queryKey: queryKey,
    queryFn: async (): Promise<MarketplaceListing[]> => {
      if (!itemId) return [];
      if (useSupabase) {
        // Corrected: marketplaceApi.getRelated likely takes itemId and limit.
        // The 'type' parameter was removed as it's not standard for this API client and caused the lint error.
        return marketplaceApi.getRelated(itemId, limit);
      } else {
        const currentMockItem = mockMarketplaceItems.find(i => String(i.id) === itemId);
        if (!currentMockItem) return [];
        const relatedItems = mockMarketplaceItems.filter(item => {
          if (String(item.id) === itemId) return false; // Exclude the item itself
          if (currentMockItem.type && item.type !== currentMockItem.type) return false; // Match type
          return true;
        });
        return relatedItems.slice(0, limit).map(mapMockMarketplaceItemToSupabaseListing);
      }
    },
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMarketplaceItem(): UseMutationResult<MarketplaceListing | null, Error, MarketplaceListingInput> {
  const queryClient = useQueryClient();
  return useMutation<MarketplaceListing | null, Error, MarketplaceListingInput>({
    mutationFn: async (itemData: MarketplaceListingInput): Promise<MarketplaceListing | null> => {
      if (useSupabase) {
         // Adapt MarketplaceListingInput (DB schema) to MarketplaceItemInput (API schema)
        const appInput: MarketplaceItemInput = {
          title: itemData.title, // Assuming itemData.title is string and MarketplaceItemInput.title is string
          description: itemData.description === null ? undefined : itemData.description, // Assumes MarketplaceItemInput.description is string | undefined
          type: itemData.type as MarketplaceItemInput['type'], // Assumes MarketplaceItemInput.type is a specific string enum
          price: itemData.price === null ? undefined : itemData.price, // Assumes MarketplaceItemInput.price is number | undefined
          condition: itemData.condition === null ? undefined : itemData.condition as MarketplaceItemInput['condition'], // Assumes MarketplaceItemInput.condition is string (enum) | undefined
          images: itemData.images === null ? undefined : itemData.images, // Assumes MarketplaceItemInput.images is string[] | undefined
          location: itemData.location === null ? undefined : itemData.location, // Assumes MarketplaceItemInput.location is string | undefined
          tags: itemData.tags === null ? undefined : itemData.tags, // Assumes MarketplaceItemInput.tags is string[] | undefined
          sellerId: itemData.seller_id || '', // Ensure seller_id is never undefined
          status: itemData.status === null ? undefined : itemData.status, // Assumes MarketplaceItemInput.status is string (enum) | undefined
          featured: itemData.featured === null ? undefined : itemData.featured, // Assumes MarketplaceItemInput.featured is boolean | undefined
        };
        return marketplaceApi.create(appInput);
      } else {
        const newMockId = String(Date.now());
        // Construct a mock MarketplaceListing based on MarketplaceListingInput
        const newItem: MarketplaceListing = {
          id: newMockId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          seller_id: itemData.seller_id || 'mock-seller-id', // Default if not provided
          title: itemData.title,
          description: itemData.description ?? null,
          price: itemData.price ?? null,
          condition: itemData.condition ?? null,
          status: itemData.status ?? 'available',
          images: itemData.images ?? [],
          location: itemData.location ?? null,
          featured: itemData.featured ?? false,
          tags: itemData.tags ?? [],
          type: itemData.type ?? 'product',
          // view_count removed as it's not in MarketplaceListing type
        };
        console.log('Mock created item:', newItem);
        return newItem;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceItems'] });
    },
  });
}

export function useUpdateMarketplaceItem(): UseMutationResult<MarketplaceListing | null, Error, { id: string; data: Partial<MarketplaceListingUpdateInput> }> {
  const queryClient = useQueryClient();
  return useMutation<MarketplaceListing | null, Error, { id: string; data: Partial<MarketplaceListingUpdateInput> }>({ // Ensure data is Partial<MarketplaceListingUpdateInput>
    mutationFn: async ({ id, data }): Promise<MarketplaceListing | null> => {
      if (useSupabase) {
        // Adapt Partial<MarketplaceListingUpdateInput> (DB schema) to Partial<MarketplaceItemInput> (API schema)
        const apiUpdateData: Partial<MarketplaceItemInput> = {};
        if (data.title !== undefined) apiUpdateData.title = data.title;
        if (data.description !== undefined) apiUpdateData.description = data.description === null ? undefined : data.description;
        if (data.type !== undefined) apiUpdateData.type = data.type as MarketplaceItemInput['type'];
        if (data.price !== undefined) apiUpdateData.price = data.price === null ? undefined : data.price;
        if (data.condition !== undefined) apiUpdateData.condition = data.condition === null ? undefined : (data.condition as MarketplaceItemInput['condition']);
        if (data.images !== undefined) apiUpdateData.images = data.images === null ? undefined : data.images;
        if (data.location !== undefined) apiUpdateData.location = data.location === null ? undefined : data.location;
        if (data.tags !== undefined) apiUpdateData.tags = data.tags === null ? undefined : data.tags;
        if (data.seller_id !== undefined) apiUpdateData.sellerId = data.seller_id || '';
        if (data.status !== undefined) apiUpdateData.status = data.status === null ? undefined : data.status;
        if (data.featured !== undefined) apiUpdateData.featured = data.featured === null ? undefined : data.featured;
        
        return marketplaceApi.update(id, apiUpdateData);
      } else {
        const itemIndex = mockMarketplaceItems.findIndex((item) => String(item.id) === id);
        if (itemIndex === -1) {
          console.error(`Mock item with id ${id} not found for update.`);
          return null;
        }
        const originalMockItem = mockMarketplaceItems[itemIndex];
        // Create a new object for the updated mock item to avoid direct mutation
        const updatedMockItemData: MockMarketplaceItemType = {
            ...originalMockItem,
            title: data.title !== undefined ? data.title : originalMockItem.title,
            description: typeof data.description === 'string' ? data.description : originalMockItem.description,
            type: data.type ? data.type as MockMarketplaceItemType['type'] : originalMockItem.type,
            price: typeof data.price === 'number' ? data.price : (data.price === null ? undefined : originalMockItem.price),
            status: data.status ? data.status as EntityStatus : originalMockItem.status,
            image: (data.images && data.images.length > 0) ? data.images[0] : originalMockItem.image,
            featured: data.featured !== undefined ? (data.featured === null ? undefined : data.featured) : originalMockItem.featured,
            // Ensure all properties of MockMarketplaceItemType are handled
            category: originalMockItem.category, // Assuming category is not updatable or handled elsewhere
            seller: originalMockItem.seller, // Assuming seller info is not updatable here
            datePosted: originalMockItem.datePosted, // datePosted is not typically updated
        };
        mockMarketplaceItems[itemIndex] = updatedMockItemData;
        const updatedListing = mapMockMarketplaceItemToSupabaseListing(updatedMockItemData);
        updatedListing.updated_at = new Date().toISOString();
        console.log('Mock updated item data:', updatedListing);
        return updatedListing;
      }
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceItems'] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceItem', id] });
    },
  });    
}

export function useDeleteMarketplaceItem(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (itemId: string): Promise<void> => {
      if (useSupabase) {
        await marketplaceApi.delete(itemId);
      } else {
        const itemIndex = mockMarketplaceItems.findIndex((item) => String(item.id) === itemId);
        if (itemIndex > -1) {
          mockMarketplaceItems.splice(itemIndex, 1);
          console.log(`Mock deleted item with id ${itemId}`);
        } else {
          console.warn(`Mock item with id ${itemId} not found for deletion.`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceItems'] });
    },
  });
}
