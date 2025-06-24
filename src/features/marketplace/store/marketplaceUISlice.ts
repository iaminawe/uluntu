import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// UI-only state for marketplace feature
export interface MarketplaceFilters {
  search?: string;
  type?: string[];
  condition?: string[];
  priceMin?: number;
  priceMax?: number;
  location?: string[];
  seller_id?: string;
}

export interface MarketplaceUIState {
  filters: MarketplaceFilters;
  selectedListingId: string | null;
  viewMode: 'grid' | 'list';
  sortBy: 'date' | 'price' | 'title' | 'condition';
  sortOrder: 'asc' | 'desc';
  priceRange: [number, number];
  expandedListings: string[]; // For list view expanded state
}

const initialState: MarketplaceUIState = {
  filters: {},
  selectedListingId: null,
  viewMode: 'grid',
  sortBy: 'date',
  sortOrder: 'desc',
  priceRange: [0, 10000],
  expandedListings: [],
};

const marketplaceUISlice = createSlice({
  name: 'marketplaceUI',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<MarketplaceFilters>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<MarketplaceFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
      state.priceRange = [0, 10000];
    },
    setSelectedListing: (state, action: PayloadAction<string | null>) => {
      state.selectedListingId = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'date' | 'price' | 'title' | 'condition'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<[number, number]>) => {
      state.priceRange = action.payload;
      state.filters.priceMin = action.payload[0];
      state.filters.priceMax = action.payload[1];
    },
    toggleListingExpanded: (state, action: PayloadAction<string>) => {
      const listingId = action.payload;
      const index = state.expandedListings.indexOf(listingId);
      if (index > -1) {
        state.expandedListings.splice(index, 1);
      } else {
        state.expandedListings.push(listingId);
      }
    },
  },
});

// Actions
export const {
  setFilters,
  updateFilters,
  clearFilters,
  setSelectedListing,
  setViewMode,
  setSortBy,
  setSortOrder,
  setPriceRange,
  toggleListingExpanded,
} = marketplaceUISlice.actions;

// Selectors
export const selectMarketplaceFilters = (state: RootState) => state.marketplaceUI.filters;
export const selectSelectedListingId = (state: RootState) => state.marketplaceUI.selectedListingId;
export const selectMarketplaceViewMode = (state: RootState) => state.marketplaceUI.viewMode;
export const selectMarketplaceSortBy = (state: RootState) => state.marketplaceUI.sortBy;
export const selectMarketplaceSortOrder = (state: RootState) => state.marketplaceUI.sortOrder;
export const selectMarketplacePriceRange = (state: RootState) => state.marketplaceUI.priceRange;
export const selectExpandedListings = (state: RootState) => state.marketplaceUI.expandedListings;

export { marketplaceUISlice };
export default marketplaceUISlice.reducer;