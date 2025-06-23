import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { ContentStatus } from '@/types';

// UI-only state for news feature
export interface NewsFilters {
  search?: string;
  tags?: string[];
  featured?: boolean;
  status?: ContentStatus;
}

export interface NewsUIState {
  filters: NewsFilters;
  selectedArticleId: string | null;
  viewMode: 'grid' | 'list';
  sortBy: 'date' | 'title' | 'featured';
  sortOrder: 'asc' | 'desc';
}

const initialState: NewsUIState = {
  filters: {},
  selectedArticleId: null,
  viewMode: 'grid',
  sortBy: 'date',
  sortOrder: 'desc',
};

const newsUISlice = createSlice({
  name: 'newsUI',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<NewsFilters>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<NewsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedArticle: (state, action: PayloadAction<string | null>) => {
      state.selectedArticleId = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'date' | 'title' | 'featured'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
  },
});

// Actions
export const {
  setFilters,
  updateFilters,
  clearFilters,
  setSelectedArticle,
  setViewMode,
  setSortBy,
  setSortOrder,
} = newsUISlice.actions;

// Selectors
export const selectNewsFilters = (state: RootState) => state.newsUI.filters;
export const selectSelectedArticleId = (state: RootState) => state.newsUI.selectedArticleId;
export const selectNewsViewMode = (state: RootState) => state.newsUI.viewMode;
export const selectNewsSortBy = (state: RootState) => state.newsUI.sortBy;
export const selectNewsSortOrder = (state: RootState) => state.newsUI.sortOrder;

export default newsUISlice.reducer;