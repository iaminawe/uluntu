import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

interface TopicsUIState {
  filters: {
    search?: string;
    sortBy: 'name' | 'sortOrder' | 'popularity';
    isActive?: boolean;
  };
  selectedTopicIds: string[];
  viewMode: 'grid' | 'list';
}

const initialState: TopicsUIState = {
  filters: {
    sortBy: 'sortOrder',
    isActive: true
  },
  selectedTopicIds: [],
  viewMode: 'grid'
};

const topicsUISlice = createSlice({
  name: 'topicsUI',
  initialState,
  reducers: {
    updateFilters: (state, action: PayloadAction<Partial<TopicsUIState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedTopicIds: (state, action: PayloadAction<string[]>) => {
      state.selectedTopicIds = action.payload;
    },
    toggleTopicSelection: (state, action: PayloadAction<string>) => {
      const topicId = action.payload;
      const index = state.selectedTopicIds.indexOf(topicId);
      if (index >= 0) {
        state.selectedTopicIds.splice(index, 1);
      } else {
        state.selectedTopicIds.push(topicId);
      }
    },
    clearSelectedTopics: (state) => {
      state.selectedTopicIds = [];
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    }
  }
});

export const {
  updateFilters,
  resetFilters,
  setSelectedTopicIds,
  toggleTopicSelection,
  clearSelectedTopics,
  setViewMode
} = topicsUISlice.actions;

// Selectors
export const selectTopicsFilters = (state: RootState) => state.topicsUI.filters;
export const selectSelectedTopicIds = (state: RootState) => state.topicsUI.selectedTopicIds;
export const selectTopicsViewMode = (state: RootState) => state.topicsUI.viewMode;

export default topicsUISlice.reducer;