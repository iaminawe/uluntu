import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store/index';
import { Group } from '../../types';
import { groupsApi, GroupInput } from '@/features/groups/api/groupsApi';
import * as mockQueries from '@/features/groups/hooks/useGroupQueries';

// Toggle between Supabase and mock data
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Define type for group filters to match the API interface
export interface GroupFilters {
  search?: string;
  visibility?: ('open' | 'closed' | 'secret')[];
}

// Define the state type
export interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  filteredGroups: Group[];
  filters: GroupFilters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  filteredGroups: [],
  filters: {},
  status: 'idle',
  error: null
};

// Async thunks
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const groups = await groupsApi.getAll();
        // If Supabase returns empty due to RLS or other issues, fall back to mock data
        if (groups.length === 0) {
          return mockQueries.useGroups().data || [];
        }
        return groups;
      } else {
        return mockQueries.useGroups().data || [];
      }
    } catch (error) {
      // If Supabase fails completely, fall back to mock data
      if (USE_SUPABASE) {
        return mockQueries.useGroups().data || [];
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch groups');
    }
  }
);

export const fetchGroupById = createAsyncThunk(
  'groups/fetchGroupById',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const group = await groupsApi.getById(id);
        return group || null;
      } else {
        const result = mockQueries.useGroup(id);
        return result?.data || null;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch group with ID: ${id}`);
    }
  }
);

export const fetchFilteredGroups = createAsyncThunk(
  'groups/fetchFilteredGroups',
  async (filters: GroupFilters, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        return await groupsApi.getAll(filters);
      } else {
        return mockQueries.useGroupsWithFilters(filters).data || [];
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch filtered groups');
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData: GroupInput, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const newGroup = await groupsApi.create(groupData);
        return newGroup;
      } else {
        // Create a mock group with the data provided
        const mockResult = mockQueries.useCreateGroup().mutateAsync(groupData);
        return mockResult;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create group');
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ id, data }: { id: string; data: Partial<GroupInput> }, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const updatedGroup = await groupsApi.update(id, data);
        return updatedGroup;
      } else {
        // Update a mock group with the data provided
        const mockResult = mockQueries.useUpdateGroup().mutateAsync({ id, data });
        return mockResult;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to update group with ID: ${id}`);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const success = await groupsApi.delete(id);
        if (success) {
          return id;
        }
        throw new Error(`Failed to delete group with ID: ${id}`);
      } else {
        await mockQueries.useDeleteGroup().mutateAsync(id);
        return id;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to delete group with ID: ${id}`);
    }
  }
);

// Create the slice
const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<GroupFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
    clearGroups(state) {
      state.groups = [];
      state.filteredGroups = [];
      state.currentGroup = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchGroups
      .addCase(fetchGroups.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.groups = action.payload;
        // Also populate filteredGroups so GroupsList can display them
        state.filteredGroups = action.payload;
        state.error = null;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchGroupById
      .addCase(fetchGroupById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentGroup = action.payload;
        state.error = null;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchFilteredGroups
      .addCase(fetchFilteredGroups.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFilteredGroups.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredGroups = action.payload;
        state.error = null;
      })
      .addCase(fetchFilteredGroups.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle createGroup
      .addCase(createGroup.fulfilled, (state, action) => {
        if (action.payload) {
          state.groups.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle updateGroup
      .addCase(updateGroup.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.groups.findIndex(group => group.id === action.payload?.id);
          if (index !== -1) {
            state.groups[index] = action.payload;
          }
          
          // Update in filteredGroups if present
          const filteredIndex = state.filteredGroups.findIndex(group => group.id === action.payload?.id);
          if (filteredIndex !== -1) {
            state.filteredGroups[filteredIndex] = action.payload;
          }
          
          // Update currentGroup if it's the same as the updated one
          if (state.currentGroup?.id === action.payload.id) {
            state.currentGroup = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle deleteGroup
      .addCase(deleteGroup.fulfilled, (state, action) => {
        const id = action.payload;
        state.groups = state.groups.filter(group => group.id !== id);
        state.filteredGroups = state.filteredGroups.filter(group => group.id !== id);
        if (state.currentGroup?.id === id) {
          state.currentGroup = null;
        }
        state.error = null;
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { setFilters, clearFilters, clearGroups } = groupsSlice.actions;
export default groupsSlice.reducer;

// Selectors
export const selectAllGroups = (state: RootState) => state.groups.groups;
export const selectCurrentGroup = (state: RootState) => state.groups.currentGroup;
export const selectFilteredGroups = (state: RootState) => state.groups.filteredGroups;
export const selectGroupsStatus = (state: RootState) => state.groups.status;
export const selectGroupsError = (state: RootState) => state.groups.error;
export const selectGroupsFilters = (state: RootState) => state.groups.filters;
