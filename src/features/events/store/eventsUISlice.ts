import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Define type for event filters
export interface EventFilters {
  search?: string;
  types?: ('in-person' | 'online' | 'hybrid')[];
  dateRange?: 'upcoming' | 'month' | 'three-months' | 'all';
}

// Define UI state for events feature
export interface EventsUIState {
  filters: EventFilters;
  selectedEvents: string[]; // For bulk operations
  viewMode: 'grid' | 'list' | 'calendar';
  sortBy: 'date' | 'name' | 'created_at';
  sortDirection: 'asc' | 'desc';
  pagination: {
    page: number;
    itemsPerPage: number;
  };
  calendarView: 'month' | 'week' | 'day';
}

// Initial state
const initialState: EventsUIState = {
  filters: {},
  selectedEvents: [],
  viewMode: 'grid',
  sortBy: 'date',
  sortDirection: 'asc',
  pagination: {
    page: 1,
    itemsPerPage: 12,
  },
  calendarView: 'month',
};

// Create the slice
const eventsUISlice = createSlice({
  name: 'eventsUI',
  initialState,
  reducers: {
    // Filter management
    setFilters(state, action: PayloadAction<EventFilters>) {
      state.filters = action.payload;
      // Reset pagination when filters change
      state.pagination.page = 1;
    },
    
    updateFilters(state, action: PayloadAction<Partial<EventFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      // Reset pagination when filters change
      state.pagination.page = 1;
    },
    
    clearFilters(state) {
      state.filters = {};
      state.pagination.page = 1;
    },
    
    // Selection management
    setSelectedEvents(state, action: PayloadAction<string[]>) {
      state.selectedEvents = action.payload;
    },
    
    toggleEventSelection(state, action: PayloadAction<string>) {
      const eventId = action.payload;
      const isSelected = state.selectedEvents.includes(eventId);
      
      if (isSelected) {
        state.selectedEvents = state.selectedEvents.filter(id => id !== eventId);
      } else {
        state.selectedEvents.push(eventId);
      }
    },
    
    selectAllEvents(state, action: PayloadAction<string[]>) {
      state.selectedEvents = action.payload;
    },
    
    clearSelection(state) {
      state.selectedEvents = [];
    },
    
    // View preferences
    setViewMode(state, action: PayloadAction<'grid' | 'list' | 'calendar'>) {
      state.viewMode = action.payload;
    },
    
    setCalendarView(state, action: PayloadAction<'month' | 'week' | 'day'>) {
      state.calendarView = action.payload;
    },
    
    setSorting(state, action: PayloadAction<{ sortBy: 'date' | 'name' | 'created_at'; sortDirection: 'asc' | 'desc' }>) {
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
  setSelectedEvents,
  toggleEventSelection,
  selectAllEvents,
  clearSelection,
  setViewMode,
  setCalendarView,
  setSorting,
  setPage,
  setItemsPerPage,
  resetUIState,
} = eventsUISlice.actions;

// Export reducer
export default eventsUISlice.reducer;

// Selectors
export const selectEventsFilters = (state: RootState) => state.eventsUI.filters;
export const selectSelectedEvents = (state: RootState) => state.eventsUI.selectedEvents;
export const selectEventsViewMode = (state: RootState) => state.eventsUI.viewMode;
export const selectEventsCalendarView = (state: RootState) => state.eventsUI.calendarView;
export const selectEventsSorting = (state: RootState) => ({
  sortBy: state.eventsUI.sortBy,
  sortDirection: state.eventsUI.sortDirection,
});
export const selectEventsPagination = (state: RootState) => state.eventsUI.pagination;

// Computed selectors
export const selectHasFilters = (state: RootState) => 
  Object.keys(state.eventsUI.filters).length > 0;

export const selectHasSelection = (state: RootState) => 
  state.eventsUI.selectedEvents.length > 0;