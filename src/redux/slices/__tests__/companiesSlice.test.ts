import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import companiesReducer, {
  fetchCompanies,
  fetchCompanyById,
  fetchFilteredCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  setFilters,
  clearFilters,
  clearCompanies,
  CompaniesState,
  CompanyFilters,
} from '../companiesSlice'; // Assuming initialState is exported if needed, or manage locally
import { Company, CompanyInput } from '../../../types';
import * as companiesApi from '../../../api/companiesApi';
import * as mockQueries from '../../../hooks/useQueries';
import * as envConfig from '../../../config/env';

// Mock modules
jest.mock('../../../api/companiesApi');
jest.mock('../../../hooks/useQueries');
jest.mock('../../../config/env', () => ({
  __esModule: true, // This is important for ES modules
  IS_SUPABASE_ENABLED: false, // Default to false, can be overridden in tests
}));

// Mock for supabase client to avoid import.meta errors and control behavior
jest.mock('../../../lib/supabase', () => {
  // Default data for resolved promises
  const defaultSingleCompany = { id: 'mock-company-id', name: 'Mocked Company', /* other fields */ };
  const defaultCompanyList = [{ ...defaultSingleCompany, id: 'mock-company-id-1', name: 'Mock Company A' }, { id: 'mock-company-id-2', name: 'Mock Company B' }];

  // Mock functions for terminal operations
  const mockSingleResolved = (data = defaultSingleCompany) => jest.fn().mockResolvedValue({ data, error: null });
  const mockListResolved = (data = defaultCompanyList) => jest.fn().mockResolvedValue({ data, error: null });
  const mockMutationResolved = (inputData) => jest.fn().mockResolvedValue({ data: inputData, error: null });
  const mockDeleteResolved = () => jest.fn().mockResolvedValue({ data: null, error: null });

  return {
    __esModule: true, // Important for ES modules
    supabase: {
      from: jest.fn((tableName) => ({
        select: jest.fn((selectString) => ({
          // For: supabase.from(...).select(...).order(...)
          order: mockListResolved(), 
          // For: supabase.from(...).select(...).single() (if ever used directly, though not in current API)
          single: mockSingleResolved(),
          // For: supabase.from(...).select(...).eq(...).single()
          eq: jest.fn(function() { 
            this.single = mockSingleResolved(); 
            return this; 
          }),
        })),
        insert: jest.fn((dataToInsert) => ({
          // For: supabase.from(...).insert(...).select(...).single()
          select: jest.fn(() => ({
            single: mockMutationResolved(Array.isArray(dataToInsert) ? dataToInsert[0] : dataToInsert),
          })),
        })),
        update: jest.fn((dataToUpdate) => ({
          // For: supabase.from(...).update(...).eq(...).select(...).single()
          eq: jest.fn((column, value) => ({
            select: jest.fn(() => ({
              single: mockMutationResolved(dataToUpdate),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          // For: supabase.from(...).delete(...).eq(...)
          eq: mockDeleteResolved(),
        })),
      })),
    },
  };
});

// Mock for useQueries hooks to prevent import.meta errors from its dependencies
jest.mock('../../../hooks/useQueries', () => ({
  __esModule: true,
  useCompanies: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useCreateCompany: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useUpdateCompany: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useDeleteCompany: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useCompany: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useCompaniesWithFilters: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

const mockCompany: Company = {
  id: '1',
  name: 'Test Company',
  description: 'A company for testing',
  industry: ['Tech'],
  logo: 'logo.png',
  status: 'published',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  // Add any other required fields from your Company type
  size: '1-10',
  founded: '2023',
  location: 'Test Location',
  website: 'https://test.com',
  featured: false,
};

const mockCompanyInput: CompanyInput = {
  name: 'Test Company Input',
  description: 'A company input for testing',
  industry: ['Tech'],
  // Add any other required fields from your CompanyInput type
  logo: 'input-logo.png',
  status: 'draft',
  size: '10-50',
  founded: '2024',
  location: 'Input Location',
  website: 'https://input.com',
  featured: true,
  coverImage: 'cover.png',
};

// Helper to create a fresh store for each test or group
const setupStore = (preloadedState?: Partial<{ companies: CompaniesState }>) => {
  return configureStore({
    reducer: {
      companies: companiesReducer,
    },
    preloadedState,
  });
};

// Define initialState locally if not exported or to ensure test isolation
const testInitialState: CompaniesState = {
  companies: [],
  currentCompany: null,
  filteredCompanies: [],
  filters: {},
  status: 'idle',
  error: null,
};

describe('companiesSlice', () => {
  let store: EnhancedStore<{ companies: CompaniesState }>;

  // Cast mocked functions for type safety
  const mockedCompaniesApi = companiesApi as jest.Mocked<typeof companiesApi>;
  const mockedMockQueries = mockQueries as jest.Mocked<typeof mockQueries>;
  const mockedEnvConfig = envConfig as jest.Mocked<typeof envConfig>;

  beforeEach(() => {
    jest.resetAllMocks(); // Reset all mocks before each test
    // Default to IS_SUPABASE_ENABLED = false for most tests
    Object.defineProperty(mockedEnvConfig, 'IS_SUPABASE_ENABLED', {
      configurable: true,
      value: false,
    });
    store = setupStore({ companies: testInitialState }); // Initialize with a clean state
  });

  it('should return the initial state', () => {
    expect(store.getState().companies).toEqual(testInitialState);
  });

  describe('synchronous reducers', () => {
    it('should handle setFilters', () => {
      const filters: CompanyFilters = { search: 'test', industries: ['Tech'] };
      store.dispatch(setFilters(filters));
      expect(store.getState().companies.filters).toEqual(filters);
    });

    it('should handle clearFilters', () => {
      store.dispatch(setFilters({ search: 'test' }));
      store.dispatch(clearFilters());
      expect(store.getState().companies.filters).toEqual({});
    });

    it('should handle clearCompanies', () => {
      const populatedState: CompaniesState = {
        ...testInitialState,
        companies: [mockCompany],
        currentCompany: mockCompany,
        filteredCompanies: [mockCompany],
        status: 'succeeded',
      };
      store = setupStore({ companies: populatedState });
      store.dispatch(clearCompanies());
      const finalState = store.getState().companies;
      expect(finalState).toEqual(testInitialState); // clearCompanies should reset to initial state
    });
  });

  describe('async thunks (mock data path - IS_SUPABASE_ENABLED = false)', () => {
    beforeEach(() => {
      Object.defineProperty(mockedEnvConfig, 'IS_SUPABASE_ENABLED', { configurable: true, value: false });
      store = setupStore({ companies: testInitialState });
      // Reset specific mocks from useQueries for this suite
      mockedMockQueries.useCompanies.mockReset();
      mockedMockQueries.useCreateCompany.mockReset();
      mockedMockQueries.useUpdateCompany.mockReset();
      mockedMockQueries.useDeleteCompany.mockReset();
      mockedMockQueries.useCompany.mockReset(); // Added reset
      mockedMockQueries.useCompaniesWithFilters.mockReset(); // Added reset
    });

    describe('fetchCompanies', () => {
      it('pending', () => {
        mockedMockQueries.useCompanies.mockReturnValue({ data: [], isLoading: true, error: null, refetch: jest.fn() });
        store.dispatch(fetchCompanies());
        expect(store.getState().companies.status).toBe('loading');
      });
      it('fulfilled', async () => {
        mockedMockQueries.useCompanies.mockReturnValue({ data: [mockCompany], isLoading: false, error: null, refetch: jest.fn() });
        await store.dispatch(fetchCompanies());
        const state = store.getState().companies;
        expect(state.status).toBe('succeeded');
        expect(state.companies).toEqual([mockCompany]);
      });
      it('rejected', async () => {
        const error = new Error('Failed to fetch');
        mockedMockQueries.useCompanies.mockImplementation(() => { throw error; });
        await store.dispatch(fetchCompanies());
        const state = store.getState().companies;
        expect(state.status).toBe('failed');
        expect(state.error).toBe(error.message);
      });
    });

    describe('fetchCompanyById', () => {
      const id = '1';
      it('pending', () => {
        mockedMockQueries.useCompany.mockReturnValue({ data: null, isLoading: true, error: null, refetch: jest.fn() });
        store.dispatch(fetchCompanyById(id));
        expect(store.getState().companies.status).toBe('loading');
      });
      it('fulfilled - found', async () => {
        mockedMockQueries.useCompany.mockReturnValue({ data: mockCompany, isLoading: false, error: null, refetch: jest.fn() });
        await store.dispatch(fetchCompanyById(id));
        const state = store.getState().companies;
        expect(state.status).toBe('succeeded');
        expect(state.currentCompany).toEqual(mockCompany);
      });
      it('fulfilled - not found', async () => {
        mockedMockQueries.useCompany.mockReturnValue({ data: null, isLoading: false, error: null, refetch: jest.fn() });
        await store.dispatch(fetchCompanyById(id));
        const state = store.getState().companies;
        expect(state.status).toBe('succeeded');
        expect(state.currentCompany).toBeNull();
      });
      it('rejected', async () => {
        const error = new Error('Failed to fetch by ID');
        mockedMockQueries.useCompany.mockImplementation(() => { throw error; });
        await store.dispatch(fetchCompanyById(id));
        const state = store.getState().companies;
        expect(state.status).toBe('failed');
        expect(state.error).toBe(error.message);
      });
    });

    describe('fetchFilteredCompanies', () => {
      const filters: CompanyFilters = { search: 'Test' };
      it('pending', () => {
        mockedMockQueries.useCompaniesWithFilters.mockReturnValue({ data: [], isLoading: true, error: null, refetch: jest.fn() });
        store.dispatch(fetchFilteredCompanies(filters));
        expect(store.getState().companies.status).toBe('loading');
      });
      it('fulfilled', async () => {
        mockedMockQueries.useCompaniesWithFilters.mockReturnValue({ data: [mockCompany], isLoading: false, error: null, refetch: jest.fn() });
        await store.dispatch(fetchFilteredCompanies(filters));
        const state = store.getState().companies;
        expect(state.status).toBe('succeeded');
        expect(state.filteredCompanies).toEqual([mockCompany]);
      });
      it('rejected', async () => {
        const error = new Error('Failed to fetch filtered');
        mockedMockQueries.useCompaniesWithFilters.mockImplementation(() => { throw error; });
        await store.dispatch(fetchFilteredCompanies(filters));
        const state = store.getState().companies;
        expect(state.status).toBe('failed');
        expect(state.error).toBe(error.message);
      });
    });

    describe('createCompany (mock path)', () => {
      it('fulfilled', async () => {
        // The mock path for createCompany in the slice doesn't call mockQueries, it constructs the company.
        await store.dispatch(createCompany(mockCompanyInput));
        const state = store.getState().companies;
        expect(state.companies.length).toBe(1);
        expect(state.companies[0].name).toBe(mockCompanyInput.name);
        expect(state.error).toBeNull();
      });
      // Rejection for mock path createCompany is less direct as it doesn't call an external async service that's mocked.
      // The try/catch in the thunk for the mock path is minimal.
    });

    describe('updateCompany (mock path)', () => {
      const companyToUpdate: Company = { ...mockCompany, id: 'existing-id', name: 'Original' };
      const updateData = { name: 'Updated Name' };
      it('fulfilled - found and updated', async () => {
        store = setupStore({ companies: { ...testInitialState, companies: [companyToUpdate], currentCompany: companyToUpdate, filteredCompanies: [companyToUpdate] } });
        await store.dispatch(updateCompany({ id: companyToUpdate.id, data: updateData }));
        const state = store.getState().companies;
        expect(state.companies[0].name).toBe(updateData.name);
        expect(state.currentCompany?.name).toBe(updateData.name);
        expect(state.filteredCompanies[0].name).toBe(updateData.name);
      });
      it('fulfilled - not found', async () => {
        store = setupStore({ companies: { ...testInitialState, companies: [mockCompany] } });
        await store.dispatch(updateCompany({ id: 'non-existent', data: updateData }));
        expect(store.getState().companies.companies.find(c=>c.name === updateData.name)).toBeUndefined();
      });
    });

    describe('deleteCompany (mock path)', () => {
      const companyToDelete: Company = { ...mockCompany, id: 'delete-id' };
      it('fulfilled - found and deleted', async () => {
        store = setupStore({ companies: { ...testInitialState, companies: [companyToDelete, mockCompany], currentCompany: companyToDelete, filteredCompanies: [companyToDelete, mockCompany] } });
        await store.dispatch(deleteCompany(companyToDelete.id));
        const state = store.getState().companies;
        expect(state.companies.find(c => c.id === companyToDelete.id)).toBeUndefined();
        expect(state.companies.length).toBe(1); // mockCompany remains
        expect(state.currentCompany).toBeNull();
      });
      it('fulfilled - not found', async () => {
        store = setupStore({ companies: { ...testInitialState, companies: [mockCompany] } });
        await store.dispatch(deleteCompany('non-existent'));
        expect(store.getState().companies.companies.length).toBe(1);
      });
    });
  });

  describe('async thunks (API path - IS_SUPABASE_ENABLED = true)', () => {
    let apiPathStore: any; // Use 'any' for store type in this dynamic context, or be more specific
    // Type for the re-imported mocked API module, reflecting the actual structure
    let ApiPathCompaniesApiModule: {
      companiesApi: {
        getAll: jest.Mock;
        getById: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
        delete: jest.Mock;
      };
    };
    let ApiPathSliceModule: {
      reducer: typeof companiesReducer;
      fetchCompanies: typeof fetchCompanies;
      fetchCompanyById: typeof fetchCompanyById;
      fetchFilteredCompanies: typeof fetchFilteredCompanies;
      createCompany: typeof createCompany;
      updateCompany: typeof updateCompany;
      deleteCompany: typeof deleteCompany;
    }; // To hold the re-imported slice module (thunks, reducer)

    beforeAll(async () => {
      jest.resetModules(); // Crucial: resets module cache

      // Mock config/env to set IS_SUPABASE_ENABLED = true for this suite
      jest.doMock('../../../config/env', () => ({
        __esModule: true,
        IS_SUPABASE_ENABLED: true,
      }));

      // Mock the actual API functions from companiesApi, ensuring the structure matches the export
      jest.doMock('../../../api/companiesApi', () => ({
        __esModule: true,
        companiesApi: { // This is the object that's actually exported
          getAll: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(), // Corrected to 'delete'
        },
      }));

      // Dynamically import modules AFTER mocks are set up
      ApiPathCompaniesApiModule = await import('../../../api/companiesApi') as any; // Cast as any to match new structure
      const sliceModule = await import('../companiesSlice');
      ApiPathSliceModule = {
        reducer: sliceModule.default,
        fetchCompanies: sliceModule.fetchCompanies,
        fetchCompanyById: sliceModule.fetchCompanyById,
        fetchFilteredCompanies: sliceModule.fetchFilteredCompanies,
        createCompany: sliceModule.createCompany,
        updateCompany: sliceModule.updateCompany,
        deleteCompany: sliceModule.deleteCompany,
      };
    });

    beforeEach(() => {
      // Clear mock history and implementations for API calls before each test
      (Object.values(ApiPathCompaniesApiModule.companiesApi) as jest.Mock[]).forEach(mockFn => {
        if (jest.isMockFunction(mockFn)) {
          mockFn.mockReset();
        }
      });
      
      // Setup store with the reducer and initial state for this API path context
      apiPathStore = configureStore({
        reducer: {
          companies: ApiPathSliceModule.reducer,
        },
        preloadedState: { companies: { ...testInitialState } } 
      });
    });

    describe('fetchCompanies (API)', () => {
      it('fulfilled', async () => {
        ApiPathCompaniesApiModule.companiesApi.getAll.mockResolvedValue([mockCompany]);
        await apiPathStore.dispatch(ApiPathSliceModule.fetchCompanies());
        expect(apiPathStore.getState().companies.companies).toEqual([mockCompany]);
        expect(ApiPathCompaniesApiModule.companiesApi.getAll).toHaveBeenCalled();
      });
      it('rejected', async () => {
        const error = new Error('API Fetch Error');
        ApiPathCompaniesApiModule.companiesApi.getAll.mockRejectedValue(error);
        await apiPathStore.dispatch(ApiPathSliceModule.fetchCompanies());
        expect(apiPathStore.getState().companies.error).toBe(error.message);
      });
    });
    
    describe('fetchCompanyById (API)', () => {
      const id = '1';
      it('fulfilled - found', async () => {
        ApiPathCompaniesApiModule.companiesApi.getById.mockResolvedValue(mockCompany);
        await apiPathStore.dispatch(ApiPathSliceModule.fetchCompanyById(id));
        expect(apiPathStore.getState().companies.currentCompany).toEqual(mockCompany);
        expect(ApiPathCompaniesApiModule.companiesApi.getById).toHaveBeenCalledWith(id);
      });
       it('fulfilled - not found', async () => {
        ApiPathCompaniesApiModule.companiesApi.getById.mockResolvedValue(null);
        await apiPathStore.dispatch(ApiPathSliceModule.fetchCompanyById(id));
        expect(apiPathStore.getState().companies.currentCompany).toBeNull();
      });
      it('rejected', async () => {
        const error = new Error('API Fetch By ID Error');
        ApiPathCompaniesApiModule.companiesApi.getById.mockRejectedValue(error);
        await apiPathStore.dispatch(ApiPathSliceModule.fetchCompanyById(id));
        expect(apiPathStore.getState().companies.error).toBe(error.message);
      });
    });

    describe('fetchFilteredCompanies (API)', () => {
      const filters: CompanyFilters = { search: 'ApiTest' };
      it('fulfilled', async () => {
        ApiPathCompaniesApiModule.companiesApi.getAll.mockResolvedValue([mockCompany]);
        await apiPathStore.dispatch(ApiPathSliceModule.fetchFilteredCompanies(filters));
        expect(apiPathStore.getState().companies.filteredCompanies).toEqual([mockCompany]);
        expect(ApiPathCompaniesApiModule.companiesApi.getAll).toHaveBeenCalledWith(filters);
      });
      it('rejected', async () => {
        const error = new Error('API Filtered Fetch Error');
        ApiPathCompaniesApiModule.companiesApi.getAll.mockRejectedValue(error);
        await apiPathStore.dispatch(ApiPathSliceModule.fetchFilteredCompanies(filters));
        expect(apiPathStore.getState().companies.error).toBe(error.message);
      });
    });

    describe('createCompany (API)', () => {
      it('fulfilled', async () => {
        ApiPathCompaniesApiModule.companiesApi.create.mockResolvedValue(mockCompany);
        await apiPathStore.dispatch(ApiPathSliceModule.createCompany(mockCompanyInput));
        expect(apiPathStore.getState().companies.companies).toContainEqual(mockCompany);
        expect(ApiPathCompaniesApiModule.companiesApi.create).toHaveBeenCalledWith(mockCompanyInput);
      });
      it('rejected', async () => {
        const error = new Error('API Create Error');
        ApiPathCompaniesApiModule.companiesApi.create.mockRejectedValue(error);
        await apiPathStore.dispatch(ApiPathSliceModule.createCompany(mockCompanyInput));
        expect(apiPathStore.getState().companies.error).toBe(error.message);
      });
    });

    describe('updateCompany (API)', () => {
      const id = 'existing-api-id';
      const companyToUpdateInApi: Company = { ...mockCompany, id, name: 'API Original' };
      const updatedCompanyFromApi: Company = { ...companyToUpdateInApi, name: 'API Updated' };
      const updateData = { name: 'API Updated' };

      it('fulfilled', async () => {
        apiPathStore = configureStore({
          reducer: { companies: ApiPathSliceModule.reducer },
          preloadedState: { companies: { ...testInitialState, companies: [companyToUpdateInApi] } }
        });
        ApiPathCompaniesApiModule.companiesApi.update.mockResolvedValue(updatedCompanyFromApi);
        await apiPathStore.dispatch(ApiPathSliceModule.updateCompany({ id, data: updateData }));
        const state = apiPathStore.getState().companies;
        expect(state.companies.find(c => c.id === id)?.name).toBe(updatedCompanyFromApi.name);
        expect(ApiPathCompaniesApiModule.companiesApi.update).toHaveBeenCalledWith(id, updateData);
      });
      it('rejected', async () => {
        // Ensure store is set up with default state for rejection test if not relying on pre-populated data
        apiPathStore = configureStore({
          reducer: { companies: ApiPathSliceModule.reducer },
          preloadedState: { companies: { ...testInitialState } }
        });
        const error = new Error('API Update Error');
        ApiPathCompaniesApiModule.companiesApi.update.mockRejectedValue(error);
        await apiPathStore.dispatch(ApiPathSliceModule.updateCompany({ id, data: updateData }));
        expect(apiPathStore.getState().companies.error).toBe(error.message);
      });
    });

    describe('deleteCompany (API)', () => {
      const id = 'delete-api-id';
      const companyToDeleteInApi: Company = { ...mockCompany, id };

      it('fulfilled', async () => {
        apiPathStore = configureStore({
          reducer: { companies: ApiPathSliceModule.reducer },
          preloadedState: { companies: { ...testInitialState, companies: [companyToDeleteInApi] } }
        });
        ApiPathCompaniesApiModule.companiesApi.delete.mockResolvedValue(true);
        await apiPathStore.dispatch(ApiPathSliceModule.deleteCompany(id));
        expect(apiPathStore.getState().companies.companies.find(c => c.id === id)).toBeUndefined();
        expect(ApiPathCompaniesApiModule.companiesApi.delete).toHaveBeenCalledWith(id);
      });
      it('rejected', async () => {
        // Ensure store is set up with default state for rejection test
        apiPathStore = configureStore({
          reducer: { companies: ApiPathSliceModule.reducer },
          preloadedState: { companies: { ...testInitialState } }
        });
        const error = new Error('API Delete Error');
        ApiPathCompaniesApiModule.companiesApi.delete.mockRejectedValue(error);
        await apiPathStore.dispatch(ApiPathSliceModule.deleteCompany(id));
        expect(apiPathStore.getState().companies.error).toBe(error.message);
      });
    });
  });
});
