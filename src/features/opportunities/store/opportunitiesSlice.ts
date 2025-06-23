import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Opportunity } from '../types';
import { opportunitiesApi, OpportunityInput } from '../api/opportunitiesApi';

// Define type for opportunity filters to match the API interface
export interface OpportunityFilters {
  search?: string;
  type?: string[];
  remote?: boolean;
  location?: string[];
  status?: string;
}

// Define the state type
export interface OpportunitiesState {
  opportunities: Opportunity[];
  currentOpportunity: Opportunity | null;
  filteredOpportunities: Opportunity[];
  featuredOpportunities: Opportunity[];
  companyOpportunities: Opportunity[];
  filters: OpportunityFilters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: OpportunitiesState = {
  opportunities: [],
  currentOpportunity: null,
  filteredOpportunities: [],
  featuredOpportunities: [],
  companyOpportunities: [],
  filters: {},
  status: 'idle',
  error: null
};

// Async thunks
export const fetchOpportunities = createAsyncThunk(
  'opportunities/fetchOpportunities',
  async (_, { rejectWithValue }) => {
    try {
      
      console.log('[OpportunitiesSlice] Fetching from Supabase...');
      const opportunities = await opportunitiesApi.getAll();
      console.log('[OpportunitiesSlice] Received opportunities:', opportunities.length);
      return opportunities;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch opportunities');
    }
  }
);

export const fetchOpportunityById = createAsyncThunk(
  'opportunities/fetchOpportunityById',
  async (id: string, { rejectWithValue }) => {
    try {
      const opportunity = await opportunitiesApi.getById(id);
      return opportunity || null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch opportunity with ID: ${id}`);
    }
  }
);

export const fetchFilteredOpportunities = createAsyncThunk(
  'opportunities/fetchFilteredOpportunities',
  async (filters: OpportunityFilters, { rejectWithValue }) => {
    try {
      return await opportunitiesApi.getAll(filters);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch filtered opportunities');
    }
  }
);

export const fetchFeaturedOpportunities = createAsyncThunk(
  'opportunities/fetchFeaturedOpportunities',
  async (limit: number = 3, { rejectWithValue }) => {
    try {
      return await opportunitiesApi.getFeatured(limit);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch featured opportunities');
    }
  }
);

export const fetchCompanyOpportunities = createAsyncThunk(
  'opportunities/fetchCompanyOpportunities',
  async (companyId: string, { rejectWithValue }) => {
    try {
      return await opportunitiesApi.getByCompany(companyId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch opportunities for company ID: ${companyId}`);
    }
  }
);

export const createOpportunity = createAsyncThunk(
  'opportunities/createOpportunity',
  async (opportunityData: OpportunityInput, { rejectWithValue }) => {
    try {
      const newOpportunity = await opportunitiesApi.create(opportunityData);
      return newOpportunity;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create opportunity');
    }
  }
);

export const updateOpportunity = createAsyncThunk(
  'opportunities/updateOpportunity',
  async ({ id, data }: { id: string; data: Partial<OpportunityInput> }, { rejectWithValue }) => {
    try {
      if (getIsSupabaseEnabled()) {
        const updatedOpportunity = await opportunitiesApi.update(id, data);
        return updatedOpportunity;
      } else {
        // Update a mock opportunity with the data provided
        const mockResult = mockQueries.useUpdateOpportunity().mutateAsync({ id, data });
        return mockResult;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to update opportunity with ID: ${id}`);
    }
  }
);

export const deleteOpportunity = createAsyncThunk(
  'opportunities/deleteOpportunity',
  async (id: string, { rejectWithValue }) => {
    try {
      if (getIsSupabaseEnabled()) {
        const success = await opportunitiesApi.delete(id);
        if (success) {
          return id;
        }
        throw new Error(`Failed to delete opportunity with ID: ${id}`);
      } else {
        await mockQueries.useDeleteOpportunity().mutateAsync(id);
        return id;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to delete opportunity with ID: ${id}`);
    }
  }
);

// Create the slice
const opportunitiesSlice = createSlice({
  name: 'opportunities',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<OpportunityFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
    clearOpportunities(state) {
      state.opportunities = [];
      state.filteredOpportunities = [];
      state.featuredOpportunities = [];
      state.companyOpportunities = [];
      state.currentOpportunity = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchOpportunities
      .addCase(fetchOpportunities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOpportunities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.opportunities = action.payload;
        state.error = null;
      })
      .addCase(fetchOpportunities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchOpportunityById
      .addCase(fetchOpportunityById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOpportunityById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOpportunity = action.payload;
        state.error = null;
      })
      .addCase(fetchOpportunityById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchFilteredOpportunities
      .addCase(fetchFilteredOpportunities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFilteredOpportunities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredOpportunities = action.payload;
        state.error = null;
      })
      .addCase(fetchFilteredOpportunities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchFeaturedOpportunities
      .addCase(fetchFeaturedOpportunities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFeaturedOpportunities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.featuredOpportunities = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedOpportunities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchCompanyOpportunities
      .addCase(fetchCompanyOpportunities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCompanyOpportunities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companyOpportunities = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanyOpportunities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle createOpportunity
      .addCase(createOpportunity.fulfilled, (state, action) => {
        if (action.payload) {
          state.opportunities.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createOpportunity.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle updateOpportunity
      .addCase(updateOpportunity.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.opportunities.findIndex(opportunity => opportunity.id === action.payload?.id);
          if (index !== -1) {
            state.opportunities[index] = action.payload;
          }
          
          // Update in filteredOpportunities if present
          const filteredIndex = state.filteredOpportunities.findIndex(opportunity => opportunity.id === action.payload?.id);
          if (filteredIndex !== -1) {
            state.filteredOpportunities[filteredIndex] = action.payload;
          }
          
          // Update in featuredOpportunities if present
          const featuredIndex = state.featuredOpportunities.findIndex(opportunity => opportunity.id === action.payload?.id);
          if (featuredIndex !== -1) {
            state.featuredOpportunities[featuredIndex] = action.payload;
          }
          
          // Update in companyOpportunities if present
          const companyIndex = state.companyOpportunities.findIndex(opportunity => opportunity.id === action.payload?.id);
          if (companyIndex !== -1) {
            state.companyOpportunities[companyIndex] = action.payload;
          }
          
          // Update currentOpportunity if it's the same as the updated one
          if (state.currentOpportunity?.id === action.payload.id) {
            state.currentOpportunity = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateOpportunity.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle deleteOpportunity
      .addCase(deleteOpportunity.fulfilled, (state, action) => {
        const id = action.payload;
        state.opportunities = state.opportunities.filter(opportunity => opportunity.id !== id);
        state.filteredOpportunities = state.filteredOpportunities.filter(opportunity => opportunity.id !== id);
        state.featuredOpportunities = state.featuredOpportunities.filter(opportunity => opportunity.id !== id);
        state.companyOpportunities = state.companyOpportunities.filter(opportunity => opportunity.id !== id);
        if (state.currentOpportunity?.id === id) {
          state.currentOpportunity = null;
        }
        state.error = null;
      })
      .addCase(deleteOpportunity.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { setFilters, clearFilters, clearOpportunities } = opportunitiesSlice.actions;
export default opportunitiesSlice.reducer;

// Selectors
export const selectAllOpportunities = (state: RootState) => state.opportunities.opportunities;
export const selectCurrentOpportunity = (state: RootState) => state.opportunities.currentOpportunity;
export const selectFilteredOpportunities = (state: RootState) => state.opportunities.filteredOpportunities;
export const selectFeaturedOpportunities = (state: RootState) => state.opportunities.featuredOpportunities;
export const selectCompanyOpportunities = (state: RootState) => state.opportunities.companyOpportunities;
export const selectOpportunitiesStatus = (state: RootState) => state.opportunities.status;
export const selectOpportunitiesError = (state: RootState) => state.opportunities.error;
export const selectOpportunitiesFilters = (state: RootState) => state.opportunities.filters;
