import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Resource } from '../../types';
import { resourcesApi, ResourceInput } from '../../api/resourcesApi';
import * as mockQueries from '../../hooks/useQueries';

// Toggle between Supabase and mock data
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Define type for resource filters to match the API interface
export interface ResourceFilters {
  search?: string;
  types?: string[];
  tags?: string[];
}

// Define the state type
export interface ResourcesState {
  resources: Resource[];
  currentResource: Resource | null;
  filteredResources: Resource[];
  groupResources: Resource[];
  filters: ResourceFilters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: ResourcesState = {
  resources: [],
  currentResource: null,
  filteredResources: [],
  groupResources: [],
  filters: {},
  status: 'idle',
  error: null
};

// Async thunks
export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        return await resourcesApi.getAll();
      } else {
        return mockQueries.useResources().data || [];
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch resources');
    }
  }
);

export const fetchResourceById = createAsyncThunk(
  'resources/fetchResourceById',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const resource = await resourcesApi.getById(id);
        return resource || null;
      } else {
        const result = mockQueries.useResource(id);
        return result?.data || null;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch resource with ID: ${id}`);
    }
  }
);

export const fetchFilteredResources = createAsyncThunk(
  'resources/fetchFilteredResources',
  async (filters: ResourceFilters, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        return await resourcesApi.getAll(filters);
      } else {
        return mockQueries.useResourcesWithFilters(filters).data || [];
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch filtered resources');
    }
  }
);

export const fetchGroupResources = createAsyncThunk(
  'resources/fetchGroupResources',
  async (groupId: string, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        // Assuming there's a getByGroup method in the API
        // If not, we might need to add it or use a filter approach
        if (typeof resourcesApi.getByGroup === 'function') {
          return await resourcesApi.getByGroup(groupId);
        } else {
          // Fallback to filtering by groupId
          const allResources = await resourcesApi.getAll();
          return allResources.filter(resource => resource.groupId === groupId);
        }
      } else {
        return mockQueries.useGroupResources(groupId).data || [];
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch resources for group ID: ${groupId}`);
    }
  }
);

export const createResource = createAsyncThunk(
  'resources/createResource',
  async (resourceData: ResourceInput, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const newResource = await resourcesApi.create(resourceData);
        return newResource;
      } else {
        // Create a mock resource with the data provided
        const mockResult = mockQueries.useCreateResource().mutateAsync(resourceData);
        return mockResult;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create resource');
    }
  }
);

export const updateResource = createAsyncThunk(
  'resources/updateResource',
  async ({ id, data }: { id: string; data: Partial<ResourceInput> }, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const updatedResource = await resourcesApi.update(id, data);
        return updatedResource;
      } else {
        // Update a mock resource with the data provided
        const mockResult = mockQueries.useUpdateResource().mutateAsync({ id, data });
        return mockResult;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to update resource with ID: ${id}`);
    }
  }
);

export const deleteResource = createAsyncThunk(
  'resources/deleteResource',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const success = await resourcesApi.delete(id);
        if (success) {
          return id;
        }
        throw new Error(`Failed to delete resource with ID: ${id}`);
      } else {
        await mockQueries.useDeleteResource().mutateAsync(id);
        return id;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to delete resource with ID: ${id}`);
    }
  }
);

// Create the slice
const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<ResourceFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
    clearResources(state) {
      state.resources = [];
      state.filteredResources = [];
      state.groupResources = [];
      state.currentResource = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchResources
      .addCase(fetchResources.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.resources = action.payload;
        state.error = null;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchResourceById
      .addCase(fetchResourceById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentResource = action.payload;
        state.error = null;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchFilteredResources
      .addCase(fetchFilteredResources.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFilteredResources.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredResources = action.payload;
        state.error = null;
      })
      .addCase(fetchFilteredResources.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchGroupResources
      .addCase(fetchGroupResources.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGroupResources.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.groupResources = action.payload;
        state.error = null;
      })
      .addCase(fetchGroupResources.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle createResource
      .addCase(createResource.fulfilled, (state, action) => {
        if (action.payload) {
          state.resources.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createResource.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle updateResource
      .addCase(updateResource.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.resources.findIndex(resource => resource.id === action.payload?.id);
          if (index !== -1) {
            state.resources[index] = action.payload;
          }
          
          // Update in filteredResources if present
          const filteredIndex = state.filteredResources.findIndex(resource => resource.id === action.payload?.id);
          if (filteredIndex !== -1) {
            state.filteredResources[filteredIndex] = action.payload;
          }
          
          // Update in groupResources if present
          const groupIndex = state.groupResources.findIndex(resource => resource.id === action.payload?.id);
          if (groupIndex !== -1) {
            state.groupResources[groupIndex] = action.payload;
          }
          
          // Update currentResource if it's the same as the updated one
          if (state.currentResource?.id === action.payload.id) {
            state.currentResource = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateResource.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle deleteResource
      .addCase(deleteResource.fulfilled, (state, action) => {
        const id = action.payload;
        state.resources = state.resources.filter(resource => resource.id !== id);
        state.filteredResources = state.filteredResources.filter(resource => resource.id !== id);
        state.groupResources = state.groupResources.filter(resource => resource.id !== id);
        if (state.currentResource?.id === id) {
          state.currentResource = null;
        }
        state.error = null;
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { setFilters, clearFilters, clearResources } = resourcesSlice.actions;
export default resourcesSlice.reducer;

// Selectors
export const selectAllResources = (state: RootState) => state.resources.resources;
export const selectCurrentResource = (state: RootState) => state.resources.currentResource;
export const selectFilteredResources = (state: RootState) => state.resources.filteredResources;
export const selectGroupResources = (state: RootState) => state.resources.groupResources;
export const selectResourcesStatus = (state: RootState) => state.resources.status;
export const selectResourcesError = (state: RootState) => state.resources.error;
export const selectResourcesFilters = (state: RootState) => state.resources.filters;
