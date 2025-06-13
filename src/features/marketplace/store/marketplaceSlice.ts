import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { marketplaceApi, MarketplaceItemInput } from '../../api/marketplaceApi';
import mockData from '../../data/mock/mockData';
import { RootState } from '../store';
import { MarketplaceListing, MarketplaceItemsQueryOptions, MockMarketplaceListing } from '../../types/marketplace';

// Define an interface for the marketplace state
export interface MarketplaceState {
  listings: MarketplaceListing[];
  currentListing: MarketplaceListing | null;
  filteredListings: MarketplaceListing[];
  relatedListings: MarketplaceListing[];
  sellerListings: MarketplaceListing[];
  filters: MarketplaceItemsQueryOptions;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: MarketplaceState = {
  listings: [],
  currentListing: null,
  filteredListings: [],
  relatedListings: [],
  sellerListings: [],
  filters: {},
  status: 'idle',
  error: null
};

// Helper function to adapt marketplace items from mock data
function adaptMockMarketplaceItem(mockItem: MockMarketplaceListing): MarketplaceListing {
  const seller_id = String(mockItem.seller?.id || mockItem.seller_id || '1');
  
  return {
    id: String(mockItem.id),
    title: mockItem.title,
    description: mockItem.description || '',
    type: mockItem.type as any || 'product',
    price: mockItem.price !== null ? Number(mockItem.price) : 0,
    condition: mockItem.condition as any || undefined,
    images: Array.isArray(mockItem.images) 
      ? mockItem.images 
      : (mockItem.image ? [mockItem.image] : []),
    createdAt: mockItem.created_at || new Date().toISOString(),
    seller: {
      id: seller_id,
      name: mockItem.seller?.name || 'Seller',
      image: mockItem.seller?.image || '/placeholder-avatar.png'
    },
    location: mockItem.location || '',
    tags: Array.isArray(mockItem.tags) ? mockItem.tags : [],
    status: mockItem.status || 'published',
    featured: mockItem.featured || false
  };
}

// Async thunks
export const fetchMarketplaceListings = createAsyncThunk(
  'marketplace/fetchListings',
  async (_, { rejectWithValue }) => {
    try {
      if (import.meta.env.VITE_USE_SUPABASE === 'true') {
        const listings = await marketplaceApi.getAll();
        return listings;
      } else {
        // Use mock data
        const mockListings = (mockData.marketplaceListings || []) as unknown as MockMarketplaceListing[];
        return mockListings.map(adaptMockMarketplaceItem);
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch marketplace listings');
    }
  }
);

export const fetchMarketplaceListingById = createAsyncThunk(
  'marketplace/fetchListingById',
  async (id: string, { rejectWithValue }) => {
    try {
      if (import.meta.env.VITE_USE_SUPABASE === 'true') {
        const listing = await marketplaceApi.getById(id);
        return listing;
      } else {
        // Use mock data
        const mockListings = (mockData.marketplaceListings || []) as unknown as MockMarketplaceListing[];
        const mockListing = mockListings.find(item => String(item.id) === id);
        return mockListing ? adaptMockMarketplaceItem(mockListing) : null;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch marketplace listing');
    }
  }
);

export const fetchFilteredMarketplaceListings = createAsyncThunk(
  'marketplace/fetchFilteredListings',
  async (filters: MarketplaceItemsQueryOptions, { rejectWithValue }) => {
    try {
      if (import.meta.env.VITE_USE_SUPABASE === 'true') {
        const listings = await marketplaceApi.getAll(filters);
        return { listings, filters };
      } else {
        // Use mock data and filter client-side
        let mockListings = (mockData.marketplaceListings || []) as unknown as MockMarketplaceListing[];
        
        // Apply filters
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          mockListings = mockListings.filter(item => 
            item.title.toLowerCase().includes(searchTerm) || 
            (item.description && item.description.toLowerCase().includes(searchTerm))
          );
        }
        
        if (filters.condition && filters.condition !== 'all') {
          mockListings = mockListings.filter(item => item.condition === filters.condition);
        }
        
        if (filters.types && filters.types.length > 0) {
          mockListings = mockListings.filter(item => filters.types!.includes(item.type));
        }
        
        if (filters.seller_id) {
          mockListings = mockListings.filter(item => 
            String(item.seller_id) === filters.seller_id || 
            String(item.seller?.id) === filters.seller_id
          );
        }
        
        if (filters.featured !== undefined) {
          mockListings = mockListings.filter(item => item.featured === filters.featured);
        }
        
        return { 
          listings: mockListings.map(adaptMockMarketplaceItem),
          filters 
        };
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch filtered marketplace listings');
    }
  }
);

export const fetchRelatedMarketplaceListings = createAsyncThunk(
  'marketplace/fetchRelatedListings',
  async ({ id, limit = 3 }: { id: string, limit?: number }, { rejectWithValue }) => {
    try {
      if (import.meta.env.VITE_USE_SUPABASE === 'true') {
        const relatedListings = await marketplaceApi.getRelated(id, limit);
        return relatedListings;
      } else {
        // Use mock data and find related items
        const mockListings = (mockData.marketplaceListings || []) as unknown as MockMarketplaceListing[];
        const currentListing = mockListings.find(item => String(item.id) === id);
        
        if (!currentListing) {
          return [];
        }
        
        // Find listings with the same type
        const relatedListings = mockListings
          .filter(item => 
            String(item.id) !== id && 
            item.type === currentListing.type
          )
          .slice(0, limit);
        
        return relatedListings.map(adaptMockMarketplaceItem);
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch related marketplace listings');
    }
  }
);

export const fetchSellerMarketplaceListings = createAsyncThunk(
  'marketplace/fetchSellerListings',
  async (sellerId: string, { rejectWithValue }) => {
    try {
      if (import.meta.env.VITE_USE_SUPABASE === 'true') {
        const listings = await marketplaceApi.getAll({ seller_id: sellerId });
        return listings;
      } else {
        // Use mock data and filter by seller
        const mockListings = (mockData.marketplaceListings || []) as unknown as MockMarketplaceListing[];
        const sellerListings = mockListings.filter(item => 
          String(item.seller_id) === sellerId || 
          String(item.seller?.id) === sellerId
        );
        
        return sellerListings.map(adaptMockMarketplaceItem);
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch seller marketplace listings');
    }
  }
);

export const createMarketplaceListing = createAsyncThunk(
  'marketplace/createListing',
  async (listingData: MarketplaceItemInput, { rejectWithValue }) => {
    try {
      if (import.meta.env.VITE_USE_SUPABASE === 'true') {
        const newListing = await marketplaceApi.create(listingData);
        return newListing;
      } else {
        // Create a new mock listing
        const mockListings = (mockData.marketplaceListings || []) as unknown as MockMarketplaceListing[];
        const newId = Math.max(...mockListings.map(item => Number(item.id)), 0) + 1;
        
        const newMockListing: MockMarketplaceListing = {
          id: String(newId),
          title: listingData.title,
          description: listingData.description || '',
          type: listingData.type,
          price: listingData.price || null,
          condition: listingData.condition || undefined,
          images: listingData.images || [],
          location: listingData.location || undefined,
          tags: listingData.tags || [],
          seller_id: listingData.sellerId,
          status: listingData.status || 'published',
          featured: listingData.featured || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        mockListings.push(newMockListing);
        return adaptMockMarketplaceItem(newMockListing);
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create marketplace listing');
    }
  }
);

export const updateMarketplaceListing = createAsyncThunk(
  'marketplace/updateListing',
  async ({ id, data }: { id: string, data: Partial<MarketplaceItemInput> }, { rejectWithValue }) => {
    try {
      if (import.meta.env.VITE_USE_SUPABASE === 'true') {
        const updatedListing = await marketplaceApi.update(id, data);
        return updatedListing;
      } else {
        // Update mock listing
        const mockListings = (mockData.marketplaceListings || []) as unknown as MockMarketplaceListing[];
        const listingIndex = mockListings.findIndex(item => String(item.id) === id);
        
        if (listingIndex === -1) {
          return rejectWithValue('Listing not found');
        }
        
        const originalListing = mockListings[listingIndex];
        const updatedMockListing: MockMarketplaceListing = {
          ...originalListing,
          title: data.title || originalListing.title,
          description: data.description !== undefined ? data.description : originalListing.description,
          type: data.type || originalListing.type,
          price: data.price !== undefined ? data.price : originalListing.price,
          condition: data.condition !== undefined ? data.condition : originalListing.condition,
          images: data.images || originalListing.images,
          location: data.location !== undefined ? data.location : originalListing.location,
          tags: data.tags || originalListing.tags,
          status: data.status || originalListing.status,
          featured: data.featured !== undefined ? data.featured : originalListing.featured,
          updated_at: new Date().toISOString()
        };
        
        mockListings[listingIndex] = updatedMockListing;
        return adaptMockMarketplaceItem(updatedMockListing);
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update marketplace listing');
    }
  }
);

export const deleteMarketplaceListing = createAsyncThunk(
  'marketplace/deleteListing',
  async (id: string, { rejectWithValue }) => {
    try {
      if (import.meta.env.VITE_USE_SUPABASE === 'true') {
        const success = await marketplaceApi.delete(id);
        if (!success) {
          return rejectWithValue('Failed to delete marketplace listing');
        }
        return id;
      } else {
        // Delete from mock data
        const mockListings = (mockData.marketplaceListings || []) as unknown as MockMarketplaceListing[];
        const listingIndex = mockListings.findIndex(item => String(item.id) === id);
        
        if (listingIndex === -1) {
          return rejectWithValue('Listing not found');
        }
        
        mockListings.splice(listingIndex, 1);
        return id;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete marketplace listing');
    }
  }
);

// Create the marketplace slice
const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<MarketplaceItemsQueryOptions>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchMarketplaceListings
      .addCase(fetchMarketplaceListings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMarketplaceListings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.listings = action.payload;
      })
      .addCase(fetchMarketplaceListings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // fetchMarketplaceListingById
      .addCase(fetchMarketplaceListingById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMarketplaceListingById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentListing = action.payload;
      })
      .addCase(fetchMarketplaceListingById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // fetchFilteredMarketplaceListings
      .addCase(fetchFilteredMarketplaceListings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFilteredMarketplaceListings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredListings = action.payload.listings;
        state.filters = action.payload.filters;
      })
      .addCase(fetchFilteredMarketplaceListings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // fetchRelatedMarketplaceListings
      .addCase(fetchRelatedMarketplaceListings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRelatedMarketplaceListings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.relatedListings = action.payload;
      })
      .addCase(fetchRelatedMarketplaceListings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // fetchSellerMarketplaceListings
      .addCase(fetchSellerMarketplaceListings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSellerMarketplaceListings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sellerListings = action.payload;
      })
      .addCase(fetchSellerMarketplaceListings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // createMarketplaceListing
      .addCase(createMarketplaceListing.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createMarketplaceListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.listings.push(action.payload);
        state.currentListing = action.payload;
      })
      .addCase(createMarketplaceListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // updateMarketplaceListing
      .addCase(updateMarketplaceListing.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateMarketplaceListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedListing = action.payload;
        // Update in listings array
        const index = state.listings.findIndex(listing => listing.id === updatedListing.id);
        if (index !== -1) {
          state.listings[index] = updatedListing;
        }
        // Update in filteredListings array
        const filteredIndex = state.filteredListings.findIndex(listing => listing.id === updatedListing.id);
        if (filteredIndex !== -1) {
          state.filteredListings[filteredIndex] = updatedListing;
        }
        // Update currentListing if it's the same
        if (state.currentListing && state.currentListing.id === updatedListing.id) {
          state.currentListing = updatedListing;
        }
        // Update in sellerListings array
        const sellerIndex = state.sellerListings.findIndex(listing => listing.id === updatedListing.id);
        if (sellerIndex !== -1) {
          state.sellerListings[sellerIndex] = updatedListing;
        }
      })
      .addCase(updateMarketplaceListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // deleteMarketplaceListing
      .addCase(deleteMarketplaceListing.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteMarketplaceListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const deletedId = action.payload;
        // Remove from listings array
        state.listings = state.listings.filter(listing => listing.id !== deletedId);
        // Remove from filteredListings array
        state.filteredListings = state.filteredListings.filter(listing => listing.id !== deletedId);
        // Clear currentListing if it's the same
        if (state.currentListing && state.currentListing.id === deletedId) {
          state.currentListing = null;
        }
        // Remove from sellerListings array
        state.sellerListings = state.sellerListings.filter(listing => listing.id !== deletedId);
      })
      .addCase(deleteMarketplaceListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { setFilters, clearFilters } = marketplaceSlice.actions;

// Export selectors
export const selectAllMarketplaceListings = (state: RootState) => state.marketplace.listings;
export const selectMarketplaceListingById = (state: RootState) => state.marketplace.currentListing;
export const selectFilteredMarketplaceListings = (state: RootState) => state.marketplace.filteredListings;
export const selectRelatedMarketplaceListings = (state: RootState) => state.marketplace.relatedListings;
export const selectSellerMarketplaceListings = (state: RootState) => state.marketplace.sellerListings;
export const selectMarketplaceFilters = (state: RootState) => state.marketplace.filters;
export const selectMarketplaceStatus = (state: RootState) => state.marketplace.status;
export const selectMarketplaceError = (state: RootState) => state.marketplace.error;

export default marketplaceSlice.reducer;
