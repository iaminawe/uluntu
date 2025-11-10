import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { [feature]Api, [Feature]Input } from '../api/[feature]Api';
import mockData from '@/data/mock/mockData';
import { RootState } from '@/store';
import { [Feature]Item, [Feature]Filters } from '../types';
import { getIsSupabaseEnabled } from '@/config/env';

/**
 * State shape for the [feature] slice
 */
export interface [Feature]State {
  // Collections
  items: [Feature]Item[];
  filteredItems: [Feature]Item[];
  
  // Single item
  currentItem: [Feature]Item | null;
  
  // UI State
  filters: [Feature]Filters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  
  // Pagination
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

/**
 * Initial state
 */
const initialState: [Feature]State = {
  items: [],
  filteredItems: [],
  currentItem: null,
  filters: {},
  status: 'idle',
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 20
};

/**
 * Helper function to adapt mock data to application format
 */
function adaptMock[Feature]Item(mockItem: any): [Feature]Item {
  return {
    id: String(mockItem.id),
    title: mockItem.title,
    description: mockItem.description || '',
    createdAt: mockItem.created_at || new Date().toISOString(),
    updatedAt: mockItem.updated_at || new Date().toISOString(),
    // Add other field mappings
  };
}

/**
 * Fetch all [feature] items
 */
export const fetch[Feature]Items = createAsyncThunk(
  '[feature]/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[[Feature]Slice] Fetching items...');
      
      if (getIsSupabaseEnabled()) {
        console.log('[[Feature]Slice] Using Supabase API');
        const items = await [feature]Api.getAll();
        return items;
      } else {
        console.log('[[Feature]Slice] Using mock data');
        const mockItems = (mockData.[feature]Items || []);
        return mockItems.map(adaptMock[Feature]Item);
      }
    } catch (error) {
      console.error('[[Feature]Slice] Error fetching items:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch [feature] items'
      );
    }
  }
);

/**
 * Fetch a single [feature] item by ID
 */
export const fetch[Feature]ItemById = createAsyncThunk(
  '[feature]/fetchItemById',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('[[Feature]Slice] Fetching item by ID:', id);
      
      if (getIsSupabaseEnabled()) {
        const item = await [feature]Api.getById(id);
        return item;
      } else {
        const mockItems = (mockData.[feature]Items || []);
        const mockItem = mockItems.find(item => String(item.id) === id);
        return mockItem ? adaptMock[Feature]Item(mockItem) : null;
      }
    } catch (error) {
      console.error('[[Feature]Slice] Error fetching item:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch [feature] item'
      );
    }
  }
);

/**
 * Fetch filtered [feature] items
 */
export const fetchFiltered[Feature]Items = createAsyncThunk(
  '[feature]/fetchFilteredItems',
  async (filters: [Feature]Filters, { rejectWithValue }) => {
    try {
      console.log('[[Feature]Slice] Fetching filtered items:', filters);
      
      if (getIsSupabaseEnabled()) {
        const items = await [feature]Api.getAll(filters);
        return { items, filters };
      } else {
        // Apply client-side filtering to mock data
        let mockItems = (mockData.[feature]Items || []);
        
        // Search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          mockItems = mockItems.filter(item => 
            item.title.toLowerCase().includes(searchTerm) || 
            item.description?.toLowerCase().includes(searchTerm)
          );
        }
        
        // Add other filter logic as needed
        
        return { 
          items: mockItems.map(adaptMock[Feature]Item),
          filters 
        };
      }
    } catch (error) {
      console.error('[[Feature]Slice] Error fetching filtered items:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch filtered [feature] items'
      );
    }
  }
);

/**
 * Create a new [feature] item
 */
export const create[Feature]Item = createAsyncThunk(
  '[feature]/createItem',
  async (itemData: [Feature]Input, { rejectWithValue }) => {
    try {
      console.log('[[Feature]Slice] Creating item:', itemData);
      
      if (getIsSupabaseEnabled()) {
        const newItem = await [feature]Api.create(itemData);
        return newItem;
      } else {
        // Create mock item
        const mockItems = (mockData.[feature]Items || []);
        const newId = Math.max(...mockItems.map(item => Number(item.id)), 0) + 1;
        
        const newMockItem = {
          id: String(newId),
          ...itemData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        mockItems.push(newMockItem);
        return adaptMock[Feature]Item(newMockItem);
      }
    } catch (error) {
      console.error('[[Feature]Slice] Error creating item:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create [feature] item'
      );
    }
  }
);

/**
 * Update an existing [feature] item
 */
export const update[Feature]Item = createAsyncThunk(
  '[feature]/updateItem',
  async ({ id, data }: { id: string; data: Partial<[Feature]Input> }, { rejectWithValue }) => {
    try {
      console.log('[[Feature]Slice] Updating item:', id, data);
      
      if (getIsSupabaseEnabled()) {
        const updatedItem = await [feature]Api.update(id, data);
        return updatedItem;
      } else {
        // Update mock item
        const mockItems = (mockData.[feature]Items || []);
        const itemIndex = mockItems.findIndex(item => String(item.id) === id);
        
        if (itemIndex === -1) {
          return rejectWithValue('[Feature] item not found');
        }
        
        const updatedMockItem = {
          ...mockItems[itemIndex],
          ...data,
          updated_at: new Date().toISOString()
        };
        
        mockItems[itemIndex] = updatedMockItem;
        return adaptMock[Feature]Item(updatedMockItem);
      }
    } catch (error) {
      console.error('[[Feature]Slice] Error updating item:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update [feature] item'
      );
    }
  }
);

/**
 * Delete a [feature] item
 */
export const delete[Feature]Item = createAsyncThunk(
  '[feature]/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('[[Feature]Slice] Deleting item:', id);
      
      if (getIsSupabaseEnabled()) {
        const success = await [feature]Api.delete(id);
        if (!success) {
          return rejectWithValue('Failed to delete [feature] item');
        }
        return id;
      } else {
        // Delete from mock data
        const mockItems = (mockData.[feature]Items || []);
        const itemIndex = mockItems.findIndex(item => String(item.id) === id);
        
        if (itemIndex === -1) {
          return rejectWithValue('[Feature] item not found');
        }
        
        mockItems.splice(itemIndex, 1);
        return id;
      }
    } catch (error) {
      console.error('[[Feature]Slice] Error deleting item:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete [feature] item'
      );
    }
  }
);

/**
 * [Feature] slice definition
 */
const [feature]Slice = createSlice({
  name: '[feature]',
  initialState,
  reducers: {
    // Synchronous actions
    setFilters: (state, action: PayloadAction<[Feature]Filters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredItems = [];
    },
    setCurrentItem: (state, action: PayloadAction<[Feature]Item | null>) => {
      state.currentItem = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all items
      .addCase(fetch[Feature]Items.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetch[Feature]Items.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetch[Feature]Items.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Fetch single item
      .addCase(fetch[Feature]ItemById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetch[Feature]ItemById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentItem = action.payload;
        state.error = null;
      })
      .addCase(fetch[Feature]ItemById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Fetch filtered items
      .addCase(fetchFiltered[Feature]Items.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFiltered[Feature]Items.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredItems = action.payload.items;
        state.filters = action.payload.filters;
        state.error = null;
      })
      .addCase(fetchFiltered[Feature]Items.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Create item
      .addCase(create[Feature]Item.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(create[Feature]Item.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
        state.currentItem = action.payload;
        state.error = null;
      })
      .addCase(create[Feature]Item.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Update item
      .addCase(update[Feature]Item.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(update[Feature]Item.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedItem = action.payload;
        
        // Update in items array
        const index = state.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
        
        // Update in filtered items
        const filteredIndex = state.filteredItems.findIndex(item => item.id === updatedItem.id);
        if (filteredIndex !== -1) {
          state.filteredItems[filteredIndex] = updatedItem;
        }
        
        // Update current item if it matches
        if (state.currentItem?.id === updatedItem.id) {
          state.currentItem = updatedItem;
        }
        
        state.error = null;
      })
      .addCase(update[Feature]Item.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Delete item
      .addCase(delete[Feature]Item.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(delete[Feature]Item.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const deletedId = action.payload;
        
        // Remove from items array
        state.items = state.items.filter(item => item.id !== deletedId);
        
        // Remove from filtered items
        state.filteredItems = state.filteredItems.filter(item => item.id !== deletedId);
        
        // Clear current item if it was deleted
        if (state.currentItem?.id === deletedId) {
          state.currentItem = null;
        }
        
        state.error = null;
      })
      .addCase(delete[Feature]Item.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { 
  setFilters, 
  clearFilters, 
  setCurrentItem, 
  clearError,
  setPage,
  setPageSize
} = [feature]Slice.actions;

// Selectors
export const selectAll[Feature]Items = (state: RootState) => state.[feature].items;
export const selectFiltered[Feature]Items = (state: RootState) => state.[feature].filteredItems;
export const select[Feature]ItemById = (state: RootState) => state.[feature].currentItem;
export const select[Feature]Filters = (state: RootState) => state.[feature].filters;
export const select[Feature]Status = (state: RootState) => state.[feature].status;
export const select[Feature]Error = (state: RootState) => state.[feature].error;
export const select[Feature]Pagination = (state: RootState) => ({
  totalCount: state.[feature].totalCount,
  currentPage: state.[feature].currentPage,
  pageSize: state.[feature].pageSize
});

// Export reducer
export default [feature]Slice.reducer;