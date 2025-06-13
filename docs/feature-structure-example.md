# Feature Structure Example: Marketplace

This example shows how the marketplace feature would be organized after the reorganization.

## Directory Structure

```
src/features/marketplace/
├── api/
│   ├── marketplaceApi.ts          # API calls for marketplace
│   └── marketplaceApi.test.ts     # API tests
├── components/
│   ├── MarketplaceList/
│   │   ├── index.tsx              # Main list component
│   │   ├── ListingCard.tsx        # Individual listing card
│   │   ├── ListingFilters.tsx     # Filter controls
│   │   ├── ListingGrid.tsx        # Grid layout
│   │   ├── types.ts               # Component-specific types
│   │   └── __tests__/
│   │       ├── MarketplaceList.test.tsx
│   │       └── ListingCard.test.tsx
│   ├── MarketplaceDetail/
│   │   ├── index.tsx              # Detail view component
│   │   ├── ContactSeller.tsx      # Contact form
│   │   ├── ImageGallery.tsx       # Product images
│   │   └── PriceDisplay.tsx       # Price information
│   └── MarketplaceForm/
│       ├── index.tsx              # Create/Edit form
│       ├── CategorySelect.tsx     # Category selector
│       ├── ImageUpload.tsx        # Image upload component
│       └── PriceInput.tsx         # Price input with validation
├── hooks/
│   ├── useMarketplaceQueries.ts   # React Query hooks
│   ├── useMarketplaceFilters.ts   # Filter state management
│   ├── useMarketplaceForm.ts      # Form state and validation
│   └── __tests__/
│       └── useMarketplaceQueries.test.ts
├── store/
│   ├── marketplaceSlice.ts        # Redux slice
│   ├── marketplaceSelectors.ts    # Memoized selectors
│   ├── marketplaceThunks.ts       # Async actions
│   └── __tests__/
│       └── marketplaceSlice.test.ts
├── types/
│   ├── index.ts                   # Main type exports
│   ├── api.types.ts               # API request/response types
│   ├── state.types.ts             # Redux state types
│   └── component.types.ts         # Component prop types
├── utils/
│   ├── priceFormatter.ts          # Price formatting utilities
│   ├── categoryMapper.ts          # Category data transformations
│   ├── validators.ts              # Input validation functions
│   └── __tests__/
│       └── priceFormatter.test.ts
├── __tests__/
│   ├── integration/
│   │   └── marketplaceFlow.test.tsx  # Full feature flow tests
│   └── fixtures/
│       └── marketplaceData.ts        # Test data
└── index.ts                          # Public API exports
```

## File Examples

### `api/marketplaceApi.ts`
```typescript
import { supabase } from '@/shared/lib/supabase';
import { 
  MarketplaceListing, 
  CreateListingRequest, 
  UpdateListingRequest,
  MarketplaceFilters 
} from '../types';

export const marketplaceApi = {
  // Get all listings with filters
  async getListings(filters?: MarketplaceFilters): Promise<MarketplaceListing[]> {
    let query = supabase.from('marketplace_listings').select('*');
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.priceRange) {
      query = query.gte('price', filters.priceRange.min)
                   .lte('price', filters.priceRange.max);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get single listing
  async getListing(id: string): Promise<MarketplaceListing> {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new listing
  async createListing(listing: CreateListingRequest): Promise<MarketplaceListing> {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert(listing)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update listing
  async updateListing(id: string, updates: UpdateListingRequest): Promise<MarketplaceListing> {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete listing
  async deleteListing(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
```

### `hooks/useMarketplaceQueries.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceApi } from '../api/marketplaceApi';
import { MarketplaceFilters, CreateListingRequest } from '../types';

// Query keys
const QUERY_KEYS = {
  all: ['marketplace'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters?: MarketplaceFilters) => [...QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
};

// Get all listings
export function useMarketplaceListings(filters?: MarketplaceFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => marketplaceApi.getListings(filters),
  });
}

// Get single listing
export function useMarketplaceListing(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => marketplaceApi.getListing(id),
    enabled: !!id,
  });
}

// Create listing mutation
export function useCreateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (listing: CreateListingRequest) => marketplaceApi.createListing(listing),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
}

// Update listing mutation
export function useUpdateListing(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: UpdateListingRequest) => marketplaceApi.updateListing(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.detail(id), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
}

// Delete listing mutation
export function useDeleteListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => marketplaceApi.deleteListing(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
}
```

### `store/marketplaceSlice.ts`
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MarketplaceState, MarketplaceFilters } from '../types';

const initialState: MarketplaceState = {
  filters: {
    category: '',
    priceRange: null,
    sortBy: 'created_at',
    searchTerm: '',
  },
  view: 'grid',
  selectedListingId: null,
};

export const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<MarketplaceFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setView: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.view = action.payload;
    },
    setSelectedListing: (state, action: PayloadAction<string | null>) => {
      state.selectedListingId = action.payload;
    },
  },
});

export const { setFilters, resetFilters, setView, setSelectedListing } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
```

### `types/index.ts`
```typescript
// Re-export all types for easy importing
export * from './api.types';
export * from './state.types';
export * from './component.types';

// Main domain type
export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  seller_id: string;
  status: 'active' | 'sold' | 'pending';
  created_at: string;
  updated_at: string;
}
```

### `index.ts` (Feature public API)
```typescript
// Components
export { MarketplaceList } from './components/MarketplaceList';
export { MarketplaceDetail } from './components/MarketplaceDetail';
export { MarketplaceForm } from './components/MarketplaceForm';

// Hooks
export { 
  useMarketplaceListings,
  useMarketplaceListing,
  useCreateListing,
  useUpdateListing,
  useDeleteListing 
} from './hooks/useMarketplaceQueries';
export { useMarketplaceFilters } from './hooks/useMarketplaceFilters';
export { useMarketplaceForm } from './hooks/useMarketplaceForm';

// Store
export { 
  marketplaceSlice,
  setFilters,
  resetFilters,
  setView,
  setSelectedListing 
} from './store/marketplaceSlice';
export * from './store/marketplaceSelectors';

// Types
export type {
  MarketplaceListing,
  MarketplaceFilters,
  CreateListingRequest,
  UpdateListingRequest,
  MarketplaceState
} from './types';

// Utils
export { formatPrice } from './utils/priceFormatter';
export { validateListingData } from './utils/validators';
```

## Benefits of This Structure

1. **Self-contained**: Everything related to marketplace is in one place
2. **Clear dependencies**: Easy to see what the feature depends on
3. **Testable**: Tests are co-located with the code they test
4. **Scalable**: Easy to add new components, hooks, or utilities
5. **Discoverable**: Developers can quickly find all marketplace-related code
6. **Type-safe**: Types are centralized and easily imported
7. **Reusable**: Components and hooks can be easily shared within the feature

## Usage in Pages

```typescript
// src/pages/marketplace/index.tsx
import { MarketplaceList, useMarketplaceFilters } from '@/features/marketplace';
import { PageLayout } from '@/shared/components/layout/PageLayout';

export default function MarketplacePage() {
  const { filters, updateFilters } = useMarketplaceFilters();
  
  return (
    <PageLayout>
      <h1>Marketplace</h1>
      <MarketplaceList 
        filters={filters}
        onFiltersChange={updateFilters}
      />
    </PageLayout>
  );
}
```

This structure makes the codebase more maintainable and scalable as the application grows.