import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ResourceFilters {
  search?: string;
  types?: string[];
  tags?: string[];
  category?: string;
  featured?: boolean;
}

export interface ResourcesUIState {
  filters: ResourceFilters;
  selectedResourceId: string | null;
  viewMode: 'grid' | 'list';
  sortBy: 'date' | 'title' | 'type';
  sortOrder: 'asc' | 'desc';
}

const initialState: ResourcesUIState = {
  filters: {},
  selectedResourceId: null,
  viewMode: 'grid',
  sortBy: 'date',
  sortOrder: 'desc',
};

export const resourcesUISlice = createSlice({
  name: 'resourcesUI',
  initialState,
  reducers: {
    updateFilters: (state, action: PayloadAction<Partial<ResourceFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedResource: (state, action: PayloadAction<string | null>) => {
      state.selectedResourceId = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'date' | 'title' | 'type'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
  },
});

export const {
  updateFilters,
  clearFilters,
  setSelectedResource,
  setViewMode,
  setSortBy,
  setSortOrder,
} = resourcesUISlice.actions;

// Selectors
export const selectResourcesFilters = (state: { resourcesUI: ResourcesUIState }) => 
  state.resourcesUI.filters;
export const selectSelectedResourceId = (state: { resourcesUI: ResourcesUIState }) => 
  state.resourcesUI.selectedResourceId;
export const selectResourcesViewMode = (state: { resourcesUI: ResourcesUIState }) => 
  state.resourcesUI.viewMode;
export const selectResourcesSortBy = (state: { resourcesUI: ResourcesUIState }) => 
  state.resourcesUI.sortBy;
export const selectResourcesSortOrder = (state: { resourcesUI: ResourcesUIState }) => 
  state.resourcesUI.sortOrder;

export default resourcesUISlice.reducer;