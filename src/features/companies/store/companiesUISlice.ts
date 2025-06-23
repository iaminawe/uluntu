import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Define type for company filters
export interface CompanyFilters {
  search?: string;
  industries?: string[];
}

// Define UI state for companies feature
export interface CompaniesUIState {
  filters: CompanyFilters;
  selectedCompanies: string[]; // For bulk operations
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'created_at' | 'updated_at';
  sortDirection: 'asc' | 'desc';
  pagination: {
    page: number;
    itemsPerPage: number;
  };
}

// Initial state
const initialState: CompaniesUIState = {
  filters: {},
  selectedCompanies: [],
  viewMode: 'grid',
  sortBy: 'name',
  sortDirection: 'asc',
  pagination: {
    page: 1,
    itemsPerPage: 12,
  },
};

// Create the slice
const companiesUISlice = createSlice({
  name: 'companiesUI',
  initialState,
  reducers: {
    // Filter management
    setFilters(state, action: PayloadAction<CompanyFilters>) {
      state.filters = action.payload;
      // Reset pagination when filters change
      state.pagination.page = 1;
    },
    
    updateFilters(state, action: PayloadAction<Partial<CompanyFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      // Reset pagination when filters change
      state.pagination.page = 1;
    },
    
    clearFilters(state) {
      state.filters = {};
      state.pagination.page = 1;
    },
    
    // Selection management
    setSelectedCompanies(state, action: PayloadAction<string[]>) {
      state.selectedCompanies = action.payload;
    },
    
    toggleCompanySelection(state, action: PayloadAction<string>) {
      const companyId = action.payload;
      const isSelected = state.selectedCompanies.includes(companyId);
      
      if (isSelected) {
        state.selectedCompanies = state.selectedCompanies.filter(id => id !== companyId);
      } else {
        state.selectedCompanies.push(companyId);
      }
    },
    
    selectAllCompanies(state, action: PayloadAction<string[]>) {
      state.selectedCompanies = action.payload;
    },
    
    clearSelection(state) {
      state.selectedCompanies = [];
    },
    
    // View preferences
    setViewMode(state, action: PayloadAction<'grid' | 'list'>) {
      state.viewMode = action.payload;
    },
    
    setSorting(state, action: PayloadAction<{ sortBy: 'name' | 'created_at' | 'updated_at'; sortDirection: 'asc' | 'desc' }>) {
      state.sortBy = action.payload.sortBy;
      state.sortDirection = action.payload.sortDirection;
    },
    
    // Pagination
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    
    setItemsPerPage(state, action: PayloadAction<number>) {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    // Bulk actions
    resetUIState(state) {
      return initialState;
    },
  },
});

// Export actions
export const {
  setFilters,
  updateFilters,
  clearFilters,
  setSelectedCompanies,
  toggleCompanySelection,
  selectAllCompanies,
  clearSelection,
  setViewMode,
  setSorting,
  setPage,
  setItemsPerPage,
  resetUIState,
} = companiesUISlice.actions;

// Export reducer
export default companiesUISlice.reducer;

// Selectors
export const selectCompaniesFilters = (state: RootState) => state.companiesUI.filters;
export const selectSelectedCompanies = (state: RootState) => state.companiesUI.selectedCompanies;
export const selectCompaniesViewMode = (state: RootState) => state.companiesUI.viewMode;
export const selectCompaniesSorting = (state: RootState) => ({
  sortBy: state.companiesUI.sortBy,
  sortDirection: state.companiesUI.sortDirection,
});
export const selectCompaniesPagination = (state: RootState) => state.companiesUI.pagination;

// Computed selectors
export const selectHasFilters = (state: RootState) => 
  Object.keys(state.companiesUI.filters).length > 0;

export const selectHasSelection = (state: RootState) => 
  state.companiesUI.selectedCompanies.length > 0;