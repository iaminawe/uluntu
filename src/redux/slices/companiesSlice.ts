import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store/index';
import { Company } from '../../types';
import { companiesApi, CompanyInput } from '@/features/companies/api/companiesApi';
import * as mockQueries from '@/hooks/useQueries';
import { IS_SUPABASE_ENABLED } from '../../config/env';

// Toggle between Supabase and mock data
const USE_SUPABASE = IS_SUPABASE_ENABLED;

// Define type for company filters to match the API interface
export interface CompanyFilters {
  search?: string;
  industries?: string[];
}

// Define the state type
export interface CompaniesState {
  companies: Company[];
  currentCompany: Company | null;
  filteredCompanies: Company[];
  filters: CompanyFilters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: CompaniesState = {
  companies: [],
  currentCompany: null,
  filteredCompanies: [],
  filters: {},
  status: 'idle',
  error: null
};

// Async thunks
export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Redux thunk: fetchCompanies started');
      if (USE_SUPABASE) {
        console.log('Using Supabase for companies data');
        const companies = await companiesApi.getAll();
        console.log('Companies fetched in thunk:', companies.length);
        return companies;
      } else {
        console.log('Using mock data for companies');
        return mockQueries.useCompanies().data || [];
      }
    } catch (error) {
      console.error('Error in fetchCompanies thunk:', error);
      // Properly reject with error message to allow error handling
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch companies');
    }
  }
);

export const fetchCompanyById = createAsyncThunk(
  'companies/fetchCompanyById',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const company = await companiesApi.getById(id);
        return company || null;
      } else {
        const result = mockQueries.useCompany(id);
        return result.data || null;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch company with ID: ${id}`);
    }
  }
);

export const fetchFilteredCompanies = createAsyncThunk(
  'companies/fetchFilteredCompanies',
  async (filters: CompanyFilters, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        return await companiesApi.getAll(filters);
      } else {
        return mockQueries.useCompaniesWithFilters(filters).data || [];
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch filtered companies');
    }
  }
);

export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (companyData: CompanyInput, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const newCompany = await companiesApi.create(companyData);
        return newCompany;
      } else {
        // Create a mock company with the data provided
        const newCompany: Company = {
          id: Date.now().toString(),
          name: companyData.name,
          description: companyData.description,
          logo: companyData.logo || '',
          coverImage: companyData.coverImage || '',
          industry: companyData.industry || [],
          size: companyData.size || '',
          founded: companyData.founded || '',
          location: companyData.location || '',
          website: companyData.website || '',
          status: companyData.status || 'published',
          featured: companyData.featured || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return newCompany;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create company');
    }
  }
);

export const updateCompany = createAsyncThunk(
  'companies/updateCompany',
  async ({ id, data }: { id: string; data: Partial<CompanyInput> }, { rejectWithValue, getState }) => {
    try {
      if (USE_SUPABASE) {
        const updatedCompany = await companiesApi.update(id, data);
        return updatedCompany;
      } else {
        const state = getState() as RootState;
        const currentCompany = state.companies.companies.find(company => company.id === id);
        
        if (!currentCompany) {
          return null;
        }

        // Create an updated version of the company with the new data
        const updatedCompany: Company = {
          ...currentCompany,
          name: data.name || currentCompany.name,
          description: data.description || currentCompany.description,
          founded: data.founded || currentCompany.founded,
          industry: data.industry || currentCompany.industry,
          size: data.size || currentCompany.size,
          logo: data.logo !== undefined ? data.logo : currentCompany.logo,
          website: data.website !== undefined ? data.website : currentCompany.website,
          featured: data.featured !== undefined ? data.featured : currentCompany.featured,
          location: data.location !== undefined ? data.location : currentCompany.location,
          coverImage: data.coverImage !== undefined ? data.coverImage : currentCompany.coverImage,
          updated_at: new Date().toISOString()
        };
        return updatedCompany;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to update company with ID: ${id}`);
    }
  }
);

export const deleteCompany = createAsyncThunk(
  'companies/deleteCompany',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const success = await companiesApi.delete(id);
        if (success) {
          return id;
        }
        throw new Error(`Failed to delete company with ID: ${id}`);
      } else {
        // Mock successful deletion
        return id;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to delete company with ID: ${id}`);
    }
  }
);

// Create the slice
const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<CompanyFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
    clearCompanies(state) {
      state.companies = [];
      state.filteredCompanies = [];
      state.currentCompany = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchCompanies
      .addCase(fetchCompanies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchCompanyById
      .addCase(fetchCompanyById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCompany = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchFilteredCompanies
      .addCase(fetchFilteredCompanies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFilteredCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredCompanies = action.payload;
        state.error = null;
      })
      .addCase(fetchFilteredCompanies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle createCompany
      .addCase(createCompany.fulfilled, (state, action) => {
        if (action.payload) {
          state.companies.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle updateCompany
      .addCase(updateCompany.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.companies.findIndex(company => company.id === action.payload?.id);
          if (index !== -1) {
            state.companies[index] = action.payload;
          }
          
          // Also update in filteredCompanies if present
          const filteredIndex = state.filteredCompanies.findIndex(company => company.id === action.payload?.id);
          if (filteredIndex !== -1) {
            state.filteredCompanies[filteredIndex] = action.payload;
          }
          
          // Update currentCompany if it's the same as the updated one
          if (state.currentCompany?.id === action.payload.id) {
            state.currentCompany = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle deleteCompany
      .addCase(deleteCompany.fulfilled, (state, action) => {
        const id = action.payload;
        state.companies = state.companies.filter(company => company.id !== id);
        state.filteredCompanies = state.filteredCompanies.filter(company => company.id !== id);
        if (state.currentCompany?.id === id) {
          state.currentCompany = null;
        }
        state.error = null;
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { setFilters, clearFilters, clearCompanies } = companiesSlice.actions;
export default companiesSlice.reducer;

// Selectors
export const selectAllCompanies = (state: RootState) => state.companies.companies;
export const selectCurrentCompany = (state: RootState) => state.companies.currentCompany;
export const selectFilteredCompanies = (state: RootState) => state.companies.filteredCompanies;
export const selectCompaniesStatus = (state: RootState) => state.companies.status;
export const selectCompaniesError = (state: RootState) => state.companies.error;
export const selectCompaniesFilters = (state: RootState) => state.companies.filters;
