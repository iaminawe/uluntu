import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// UI-only state for groups feature
export interface GroupsFilters {
  search?: string;
  visibility?: string | string[];
  featured?: boolean;
  memberStatus?: 'member' | 'not-member' | 'all';
  userGroups?: boolean;
  userId?: string;
  limit?: number;
}

export interface GroupsUIState {
  filters: GroupsFilters;
  selectedGroupId: string | null;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'members' | 'created' | 'activity';
  sortOrder: 'asc' | 'desc';
  expandedGroups: string[]; // For list view expanded state
}

const initialState: GroupsUIState = {
  filters: {
    visibility: 'all',
    memberStatus: 'all',
  },
  selectedGroupId: null,
  viewMode: 'grid',
  sortBy: 'activity',
  sortOrder: 'desc',
  expandedGroups: [],
};

const groupsUISlice = createSlice({
  name: 'groupsUI',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<GroupsFilters>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<GroupsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        visibility: 'all',
        memberStatus: 'all',
      };
    },
    setSelectedGroup: (state, action: PayloadAction<string | null>) => {
      state.selectedGroupId = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'name' | 'members' | 'created' | 'activity'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    toggleGroupExpanded: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      const index = state.expandedGroups.indexOf(groupId);
      if (index > -1) {
        state.expandedGroups.splice(index, 1);
      } else {
        state.expandedGroups.push(groupId);
      }
    },
  },
});

// Actions
export const {
  setFilters,
  updateFilters,
  clearFilters,
  setSelectedGroup,
  setViewMode,
  setSortBy,
  setSortOrder,
  toggleGroupExpanded,
} = groupsUISlice.actions;

// Selectors
export const selectGroupsFilters = (state: RootState) => state.groupsUI.filters;
export const selectSelectedGroupId = (state: RootState) => state.groupsUI.selectedGroupId;
export const selectGroupsViewMode = (state: RootState) => state.groupsUI.viewMode;
export const selectGroupsSortBy = (state: RootState) => state.groupsUI.sortBy;
export const selectGroupsSortOrder = (state: RootState) => state.groupsUI.sortOrder;
export const selectExpandedGroups = (state: RootState) => state.groupsUI.expandedGroups;

export default groupsUISlice.reducer;