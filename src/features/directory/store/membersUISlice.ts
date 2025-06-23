import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Define type for member filters
export interface MemberFilters {
  search?: string;
  skills?: string[];
}

// Define UI state for members feature  
export interface MembersUIState {
  filters: MemberFilters;
  selectedMembers: string[]; // For bulk operations
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'joinDate' | 'created_at';
  sortDirection: 'asc' | 'desc';
  pagination: {
    page: number;
    itemsPerPage: number;
  };
}

// Initial state
const initialState: MembersUIState = {
  filters: {},
  selectedMembers: [],
  viewMode: 'grid',
  sortBy: 'name',
  sortDirection: 'asc',
  pagination: {
    page: 1,
    itemsPerPage: 12,
  },
};

// Create the slice
const membersUISlice = createSlice({
  name: 'membersUI',
  initialState,
  reducers: {
    // Filter management
    setFilters(state, action: PayloadAction<MemberFilters>) {
      state.filters = action.payload;
      // Reset pagination when filters change
      state.pagination.page = 1;
    },
    
    updateFilters(state, action: PayloadAction<Partial<MemberFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      // Reset pagination when filters change
      state.pagination.page = 1;
    },
    
    clearFilters(state) {
      state.filters = {};
      state.pagination.page = 1;
    },
    
    // Selection management
    setSelectedMembers(state, action: PayloadAction<string[]>) {
      state.selectedMembers = action.payload;
    },
    
    toggleMemberSelection(state, action: PayloadAction<string>) {
      const memberId = action.payload;
      const isSelected = state.selectedMembers.includes(memberId);
      
      if (isSelected) {
        state.selectedMembers = state.selectedMembers.filter(id => id !== memberId);
      } else {
        state.selectedMembers.push(memberId);
      }
    },
    
    selectAllMembers(state, action: PayloadAction<string[]>) {
      state.selectedMembers = action.payload;
    },
    
    clearSelection(state) {
      state.selectedMembers = [];
    },
    
    // View preferences
    setViewMode(state, action: PayloadAction<'grid' | 'list'>) {
      state.viewMode = action.payload;
    },
    
    setSorting(state, action: PayloadAction<{ sortBy: 'name' | 'joinDate' | 'created_at'; sortDirection: 'asc' | 'desc' }>) {
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
  setSelectedMembers,
  toggleMemberSelection,
  selectAllMembers,
  clearSelection,
  setViewMode,
  setSorting,
  setPage,
  setItemsPerPage,
  resetUIState,
} = membersUISlice.actions;

// Export reducer
export default membersUISlice.reducer;

// Selectors
export const selectMembersFilters = (state: RootState) => state.membersUI.filters;
export const selectSelectedMembers = (state: RootState) => state.membersUI.selectedMembers;
export const selectMembersViewMode = (state: RootState) => state.membersUI.viewMode;
export const selectMembersSorting = (state: RootState) => ({
  sortBy: state.membersUI.sortBy,
  sortDirection: state.membersUI.sortDirection,
});
export const selectMembersPagination = (state: RootState) => state.membersUI.pagination;

// Computed selectors
export const selectHasFilters = (state: RootState) => 
  Object.keys(state.membersUI.filters).length > 0;

export const selectHasSelection = (state: RootState) => 
  state.membersUI.selectedMembers.length > 0;