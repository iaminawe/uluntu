import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { UnifiedSettingsSection } from '../hooks/useUnifiedSettings';

export interface AdminSettingsUIState {
  activeSection: UnifiedSettingsSection;
  searchTerm: string;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  selectedItems: string[];
  sortBy: 'name' | 'category' | 'updated';
  sortOrder: 'asc' | 'desc';
}

const initialState: AdminSettingsUIState = {
  activeSection: 'general',
  searchTerm: '',
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  selectedItems: [],
  sortBy: 'name',
  sortOrder: 'asc'
};

const adminSettingsUISlice = createSlice({
  name: 'adminSettingsUI',
  initialState,
  reducers: {
    setActiveSection: (state, action: PayloadAction<UnifiedSettingsSection>) => {
      state.activeSection = action.payload;
      // Clear search when switching sections
      state.searchTerm = '';
      state.selectedItems = [];
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    setSelectedItems: (state, action: PayloadAction<string[]>) => {
      state.selectedItems = action.payload;
    },
    toggleSelectedItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedItems.includes(id)) {
        state.selectedItems = state.selectedItems.filter(item => item !== id);
      } else {
        state.selectedItems.push(id);
      }
    },
    clearSelection: (state) => {
      state.selectedItems = [];
    },
    setSortBy: (state, action: PayloadAction<'name' | 'category' | 'updated'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    clearFilters: (state) => {
      state.searchTerm = '';
      state.selectedItems = [];
      state.sortBy = 'name';
      state.sortOrder = 'asc';
    }
  }
});

export const {
  setActiveSection,
  setSearchTerm,
  setSidebarCollapsed,
  setMobileMenuOpen,
  setSelectedItems,
  toggleSelectedItem,
  clearSelection,
  setSortBy,
  setSortOrder,
  clearFilters
} = adminSettingsUISlice.actions;

// Selectors
export const selectAdminSettingsUI = (state: RootState) => state.adminSettingsUI;
export const selectActiveSection = (state: RootState) => state.adminSettingsUI.activeSection;
export const selectSearchTerm = (state: RootState) => state.adminSettingsUI.searchTerm;
export const selectSidebarCollapsed = (state: RootState) => state.adminSettingsUI.sidebarCollapsed;
export const selectMobileMenuOpen = (state: RootState) => state.adminSettingsUI.mobileMenuOpen;
export const selectSelectedItems = (state: RootState) => state.adminSettingsUI.selectedItems;

export default adminSettingsUISlice.reducer;
