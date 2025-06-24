import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// UI-only state for opportunities feature
export interface OpportunityFilters {
  search?: string;
  type?: string[];
  remote?: boolean;
  location?: string[];
  status?: string;
  featured?: boolean;
  company_id?: string;
}

export interface OpportunitiesUIState {
  filters: OpportunityFilters;
  selectedOpportunityId: string | null;
  viewMode: 'grid' | 'list';
  sortBy: 'date' | 'title' | 'company' | 'type';
  sortOrder: 'asc' | 'desc';
  showRemoteOnly: boolean;
  expandedOpportunities: string[]; // For list view expanded state
}

const initialState: OpportunitiesUIState = {
  filters: {
    status: 'active',
  },
  selectedOpportunityId: null,
  viewMode: 'grid',
  sortBy: 'date',
  sortOrder: 'desc',
  showRemoteOnly: false,
  expandedOpportunities: [],
};

const opportunitiesUISlice = createSlice({
  name: 'opportunitiesUI',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<OpportunityFilters>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<OpportunityFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'active',
      };
    },
    setSelectedOpportunity: (state, action: PayloadAction<string | null>) => {
      state.selectedOpportunityId = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'date' | 'title' | 'company' | 'type'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    setShowRemoteOnly: (state, action: PayloadAction<boolean>) => {
      state.showRemoteOnly = action.payload;
      // Update filters when remote toggle changes
      state.filters.remote = action.payload ? true : undefined;
    },
    toggleOpportunityExpanded: (state, action: PayloadAction<string>) => {
      const opportunityId = action.payload;
      const index = state.expandedOpportunities.indexOf(opportunityId);
      if (index > -1) {
        state.expandedOpportunities.splice(index, 1);
      } else {
        state.expandedOpportunities.push(opportunityId);
      }
    },
  },
});

// Actions
export const {
  setFilters,
  updateFilters,
  clearFilters,
  setSelectedOpportunity,
  setViewMode,
  setSortBy,
  setSortOrder,
  setShowRemoteOnly,
  toggleOpportunityExpanded,
} = opportunitiesUISlice.actions;

// Selectors
export const selectOpportunityFilters = (state: RootState) => state.opportunitiesUI.filters;
export const selectSelectedOpportunityId = (state: RootState) => state.opportunitiesUI.selectedOpportunityId;
export const selectOpportunitiesViewMode = (state: RootState) => state.opportunitiesUI.viewMode;
export const selectOpportunitiesSortBy = (state: RootState) => state.opportunitiesUI.sortBy;
export const selectOpportunitiesSortOrder = (state: RootState) => state.opportunitiesUI.sortOrder;
export const selectShowRemoteOnly = (state: RootState) => state.opportunitiesUI.showRemoteOnly;
export const selectExpandedOpportunities = (state: RootState) => state.opportunitiesUI.expandedOpportunities;

export default opportunitiesUISlice.reducer;