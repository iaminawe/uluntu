import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { marketplaceApi, MarketplaceItemInput } from '../api/marketplaceApi';
import mockData from '../data/mock/mockData';
import { ContentStatus } from '../types/common';
import { MarketplaceItem } from '../types';
import { MarketplaceListing, MarketplaceItemsQueryOptions, MockMarketplaceListing } from '../types/marketplace';

// Extending the centralized MarketplaceListing type for internal use
interface InternalMarketplaceFields {
  // Add API-specific fields that may not be in the UI model
  created_at: string;
  updated_at: string;
  seller_id: string;
}

// Combined type for internal use
type InternalMarketplaceListing = MarketplaceListing & InternalMarketplaceFields;

/**
 * Helper function to adapt a MarketplaceItem from the API to our MarketplaceListing type
 * Uses type assertion to safely handle potential differences between API and local types
 */
function adaptMarketplaceItemToListing(item: MarketplaceItem): MarketplaceListing {
  // Use type assertion with a more specific interface to safely access properties
  // This helps avoid using 'any' while still providing flexibility
  const apiItem = item as unknown as {
    id: string;
    title: string;
    description?: string;
    type?: 'product' | 'service';
    price?: number | null;
    condition?: string | undefined;
    seller_id: string;
    status: 'draft' | 'published' | 'archived';
    created_at?: string;
    updated_at?: string;
    images?: string[];
    image?: string;
    location?: string | undefined;
    tags: string[];
    featured?: boolean;
  };
  
  const seller_id = apiItem.seller_id || '';
  
  // Convert to our standardized format
  return {
    id: String(item.id),
    title: item.title || '',
    description: item.description || '',
    type: item.type || 'product',
    price: apiItem.price !== undefined ? apiItem.price : null,
    condition: apiItem.condition || null,
    images: Array.isArray(apiItem.images) ? apiItem.images : 
            (apiItem.image ? [apiItem.image] : []),
    createdAt: apiItem.created_at || new Date().toISOString(),
    seller: {
      id: String(seller_id),
      name: 'Seller', // We might need to fetch the actual seller name separately
      image: '/placeholder-avatar.png'
    },
    location: apiItem.location || '',
    tags: Array.isArray(apiItem.tags) ? apiItem.tags : [],
    status: (item.status || 'published') as ContentStatus,
    featured: apiItem.featured ?? false,
    
    // Include API-specific fields for internal use
    created_at: apiItem.created_at || new Date().toISOString(),
    updated_at: apiItem.updated_at || new Date().toISOString(),
    seller_id: seller_id
  } as MarketplaceListing & InternalMarketplaceListing;
}

// MarketplaceItemsQueryOptions is now imported from '../types/marketplace'

type MarketplaceItemsQueryKey = readonly ['marketplaceListings', 'filters', MarketplaceItemsQueryOptions | undefined];

/**
 * Maps a mock marketplace item to the expected MarketplaceListing format
 * This ensures consistent data structure between mock and database sources
 */
function mapMockMarketplaceItemToListing(mockItem: MockMarketplaceListing): MarketplaceListing {
  const seller_id = String(mockItem.seller?.id || mockItem.seller_id || '1');
  
  return {
    id: String(mockItem.id),
    title: mockItem.title,
    description: mockItem.description || '',
    type: mockItem.type || 'product',
    price: mockItem.price !== undefined ? mockItem.price : null,
    condition: mockItem.condition || null,
    images: Array.isArray(mockItem.images) ? mockItem.images : 
           (mockItem.image ? [mockItem.image] : []),
    createdAt: mockItem.created_at || new Date().toISOString(),
    seller: {
      id: seller_id,
      name: 'Seller', // We might need to fetch the actual seller name separately
      image: '/placeholder-avatar.png'
    },
    location: mockItem.location || '',
    tags: Array.isArray(mockItem.tags) ? mockItem.tags : [],
    status: mockItem.status || 'published',
    featured: mockItem.featured ?? false,
    
    // Include API-specific fields for internal use
    created_at: mockItem.created_at || new Date().toISOString(),
    updated_at: mockItem.updated_at || new Date().toISOString(),
    seller_id: seller_id
  } as MarketplaceListing & InternalMarketplaceListing;
}


// Configuration for using Supabase or mock data
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Define input types based on Database schema
export type MarketplaceListingInput = {
  title: string;
  description?: string;
  price?: number | null;
  condition?: string | null;
  status?: ContentStatus;
  images?: string[];
  location?: string | null;
  featured?: boolean;
  tags?: string[];
  seller_id?: string;
  type?: string;
};

export type MarketplaceListingUpdateInput = Partial<MarketplaceListingInput>;

// Export query key type
export type { MarketplaceItemsQueryKey };


// Use marketplaceListings from mockData and cast to MockMarketplaceListing[] to avoid type errors
const mockMarketplaceItems = (mockData.marketplaceListings || []) as unknown as MockMarketplaceListing[];

// Hooks

export function useMarketplaceItemsWithFilters(filters?: MarketplaceItemsQueryOptions): UseQueryResult<MarketplaceListing[], Error> {
  const queryKey: MarketplaceItemsQueryKey = ['marketplaceListings', 'filters', filters];
  return useQuery<MarketplaceListing[], Error>({
    queryKey: queryKey,
    queryFn: async (): Promise<MarketplaceListing[]> => {
      // Update filters to use the seller_id if provided
      if (USE_SUPABASE) {
        try {
          let fetchedItems;
          if (filters) {
            // Make sure we're using the correct filter property names
            // Since getAll accepts filters parameter, we can just pass it directly
            fetchedItems = await marketplaceApi.getAll(filters);
          } else {
            fetchedItems = await marketplaceApi.getAll();
          }
          const marketplaceListings = (fetchedItems || []).map(adaptMarketplaceItemToListing);
          console.log('Fetched marketplace listings with filters:', marketplaceListings);
          return marketplaceListings;
        } catch (error) {
          console.error('Error fetching marketplace listings with filters:', error);
          throw error;
        }
      } else {
        // Use mock data with filtering
        let listings: MarketplaceListing[] = mockMarketplaceItems.map(mapMockMarketplaceItemToListing);
        
        // Apply filters if provided
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          listings = listings.filter(
            (listing) => (listing.title.toLowerCase().includes(searchTerm) || 
                         (listing.description && listing.description.toLowerCase().includes(searchTerm)))
          );
        }
        if (filters?.types && filters.types.length > 0) {
          listings = listings.filter((listing) => listing.type && filters.types?.includes(listing.type));
        }
        if (filters?.condition && filters.condition !== 'all') {
          listings = listings.filter((listing) => listing.condition === filters.condition);
        }
        if (filters && filters.seller_id) {
          listings = listings.filter(item => {
            // Get seller id from internal property or the standard seller object
            const itemSellerId = 'seller_id' in item ? 
              (item as unknown as { seller_id: string }).seller_id : 
              item.seller?.id;
            return itemSellerId === filters.seller_id;
          });
        }
        if (filters?.featured !== undefined) {
          listings = listings.filter((listing) => listing.featured === filters.featured);
        }
        
        return listings;
      }
    },
  });
}

export function useMarketplaceItems(): UseQueryResult<MarketplaceListing[], Error> {
  return useQuery<MarketplaceListing[], Error>({
    queryKey: ['marketplaceItems', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<MarketplaceListing[]> => {
      if (USE_SUPABASE) {
        try {
          const items = await marketplaceApi.getAll();
          return items.map(item => adaptMarketplaceItemToListing(item));
        } catch (error) {
          console.error('Error fetching marketplace items:', error);
          throw error;
        }
      } else {
        return mockMarketplaceItems.map(mapMockMarketplaceItemToListing);
      }
    },
  });
}

export function useMarketplaceItem(id: string | undefined): UseQueryResult<MarketplaceListing | null, Error> {
  const stringId = id ? String(id) : undefined;
  
  return useQuery<MarketplaceListing | null, Error>({
    queryKey: ['marketplaceItem', stringId, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<MarketplaceListing | null> => {
      if (!stringId) return null;
      
      if (USE_SUPABASE) {
        try {
          const item = await marketplaceApi.getById(stringId);
          return item ? adaptMarketplaceItemToListing(item) : null;
        } catch (error) {
          console.error(`Error fetching marketplace item with ID ${stringId}:`, error);
          throw error;
        }
      } else {
        const item = mockMarketplaceItems.find((item) => String(item.id) === stringId);
        return item ? mapMockMarketplaceItemToListing(item) : null;
      }
    },
    enabled: !!stringId,
  });
}

export function useRelatedMarketplaceItems(itemId?: string, limit: number = 3): UseQueryResult<MarketplaceListing[], Error> {
  const stringId = itemId ? String(itemId) : undefined;
  
  return useQuery<MarketplaceListing[], Error>({
    queryKey: ['relatedMarketplaceItems', stringId, limit, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<MarketplaceListing[]> => {
      if (!stringId) return [];

      if (USE_SUPABASE) {
        try {
          const items = await marketplaceApi.getRelated(stringId, limit);
          return items.map(item => adaptMarketplaceItemToListing(item));
        } catch (error) {
          console.error(`Error fetching related marketplace items for ID ${stringId}:`, error);
          throw error;
        }
      } else {
        // Find the item's type for related filtering
        const originalItem = mockMarketplaceItems.find((item) => String(item.id) === stringId);
        if (!originalItem) return [];

        // Get items of the same type, excluding the current item
        let relatedItems = mockMarketplaceItems
          .filter((item) => String(item.id) !== stringId && item.type === originalItem.type)
          .slice(0, limit);

        // If we don't have enough items, add some random items up to the limit
        if (relatedItems.length < limit) {
          const randomItems = mockMarketplaceItems
            .filter((item) => String(item.id) !== stringId && !relatedItems.some((r) => String(r.id) === String(item.id)))
            .slice(0, limit - relatedItems.length);
          relatedItems = [...relatedItems, ...randomItems];
        }

        return relatedItems.map(mapMockMarketplaceItemToListing);
      }
    },
    enabled: !!stringId,
  });
}

export function useCreateMarketplaceItem(): UseMutationResult<MarketplaceListing | null, Error, MarketplaceListingInput> {
  const queryClient = useQueryClient();
  
  return useMutation<MarketplaceListing | null, Error, MarketplaceListingInput>({
    mutationFn: async (itemData: MarketplaceListingInput): Promise<MarketplaceListing | null> => {
      if (USE_SUPABASE) {
        try {
          const apiItemData: MarketplaceItemInput = {
            title: itemData.title || '',
            description: itemData.description === null ? undefined : (itemData.description || ''),
            // Ensure type is correctly formatted
            type: itemData.type ? itemData.type : 'product',
            // Handle optional fields with proper null/undefined handling
            price: itemData.price === null ? undefined : itemData.price,
            condition: itemData.condition === null ? undefined : itemData.condition,
            sellerId: itemData.seller_id || '',
            status: (itemData.status || 'published') as ContentStatus,
            featured: itemData.featured === undefined ? false : itemData.featured,
            // Ensure images is always an array
            images: Array.isArray(itemData.images) ? itemData.images : [],
            // Ensure tags is always an array of strings
            tags: Array.isArray(itemData.tags) ? 
              itemData.tags.map(tag => typeof tag === 'string' ? tag : String((tag as {value?: string}).value || '')) : 
              [],
            location: itemData.location === null ? undefined : itemData.location
          };
          
          const newItem = await marketplaceApi.create(apiItemData);
          return newItem ? adaptMarketplaceItemToListing(newItem) : null;
        } catch (error) {
          console.error('Error creating marketplace item:', error);
          throw error;
        }
      } else {
        // Prepare a new mock item with required format
        const newItem: MockMarketplaceListing = {
          id: crypto.randomUUID(),
          title: itemData.title,
          description: itemData.description || '',
          type: itemData.type || 'product',
          price: itemData.price !== undefined ? itemData.price : null,
          status: itemData.status || 'published',
          images: itemData.images || [],
          featured: itemData.featured || false,
          seller_id: itemData.seller_id || '1', // Default seller ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: itemData.location || undefined,
          tags: itemData.tags || [],
          condition: itemData.condition || undefined
        };
        // Add to mock data collection
        mockMarketplaceItems.push(newItem);
        // Map the mock item to the expected format
        const createdListing = mapMockMarketplaceItemToListing(newItem);
        console.log('Mock created marketplace item:', createdListing);
        return createdListing;
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
  return useMutation<MarketplaceListing | null, Error, { id: string; data: Partial<MarketplaceListingUpdateInput> }>({
    mutationFn: async ({ id, data }): Promise<MarketplaceListing | null> => {
      if (USE_SUPABASE) {
        // Adapt Partial<MarketplaceListingUpdateInput> (DB schema) to Partial<MarketplaceItemInput> (API schema)
        const apiUpdateData: Partial<MarketplaceItemInput> = {};
        if (data.title !== undefined) apiUpdateData.title = data.title;
        if (data.description !== undefined) apiUpdateData.description = data.description === null ? undefined : data.description;
        if (data.type !== undefined) apiUpdateData.type = data.type as MarketplaceItemInput['type'];
        // For update mutations, we'll need a helper function to avoid type errors with undefined/null
        const handleNullValue = <T>(value: T | null | undefined): T | undefined => {
          if (value === null || value === undefined) return undefined;
          return value as T;
        };
        
        // Safe conversion for number values
        const handleNumberValue = (value: number | null | undefined): number | undefined => {
          if (value === null || value === undefined) return undefined;
          return value;
        };
        
        // Safe conversion for string values
        const handleStringValue = (value: string | null | undefined): string | undefined => {
          if (value === null || value === undefined) return undefined;
          return value;
        };
        
        // Handle price: convert null to undefined for API compatibility
        if (data.price !== undefined) apiUpdateData.price = handleNumberValue(data.price);
        
        // Handle condition: convert null to undefined for API compatibility
        if (data.condition !== undefined) apiUpdateData.condition = handleStringValue(data.condition);
        
        // Handle arrays and strings with null checking
        if (data.images !== undefined) apiUpdateData.images = data.images === null ? [] : data.images;
        if (data.location !== undefined) apiUpdateData.location = data.location === null ? undefined : data.location;
        if (data.tags !== undefined) apiUpdateData.tags = data.tags === null ? [] : data.tags;
        // Handle seller_id, ensuring it's a string or undefined (not null)
        if (data.seller_id !== undefined) apiUpdateData.sellerId = data.seller_id === null ? undefined : data.seller_id;
        if (data.status !== undefined) apiUpdateData.status = data.status === null ? undefined : (data.status as ContentStatus);
        if (data.featured !== undefined) apiUpdateData.featured = handleNullValue(data.featured);
        
        const updatedItem = await marketplaceApi.update(id, apiUpdateData);
        return updatedItem ? adaptMarketplaceItemToListing(updatedItem) : null;
      } else {
        const itemIndex = mockMarketplaceItems.findIndex((item) => String(item.id) === id);
        if (itemIndex === -1) {
          console.error(`Mock item with id ${id} not found for update.`);
          return null;
        }
        const originalMockItem = mockMarketplaceItems[itemIndex];
        // Create a new object for the updated mock item to avoid direct mutation
        const updatedMockItemData: MockMarketplaceListing = {
          ...originalMockItem,
          title: data.title !== undefined ? data.title : originalMockItem.title,
          description: data.description !== undefined ? data.description : originalMockItem.description,
          type: data.type !== undefined ? data.type : originalMockItem.type,
          price: data.price !== undefined ? (data.price === null ? null : data.price) : originalMockItem.price,
          status: data.status !== undefined ? (data.status as ContentStatus) : originalMockItem.status,
          images: data.images !== undefined ? data.images : originalMockItem.images,
          featured: data.featured !== undefined ? (data.featured === null ? false : data.featured) : originalMockItem.featured,
          tags: data.tags !== undefined ? data.tags : originalMockItem.tags,
          condition: data.condition !== undefined ? (data.condition === null ? undefined : data.condition) : originalMockItem.condition,
          location: data.location !== undefined ? (data.location === null ? undefined : data.location) : originalMockItem.location,
          seller_id: data.seller_id !== undefined ? data.seller_id : originalMockItem.seller_id,
          updated_at: new Date().toISOString(),
        };
        mockMarketplaceItems[itemIndex] = updatedMockItemData;
        // Map the updated mock item to the expected format
        const updatedListing = mapMockMarketplaceItemToListing(updatedMockItemData);
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
      if (USE_SUPABASE) {
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
