// First, define the mock data
const mockCompanies = [
  {
    id: '1',
    name: 'Tech Innovators',
    description: 'Leading tech company',
    logo: 'https://example.com/logo1.jpg',
    industry: ['Software', 'AI'],
    size: '50-100',
    founded: '2010',
    location: 'Vancouver, BC',
    website: 'https://techinnovators.com',
    status: 'published',
    featured: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-06-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Digital Solutions',
    description: 'Custom software development',
    logo: 'https://example.com/logo2.jpg',
    industry: ['Software', 'Consulting'],
    size: '10-50',
    founded: '2015',
    location: 'Nelson, BC',
    website: 'https://digitalsolutions.com',
    status: 'published',
    featured: false,
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-07-20T00:00:00Z'
  }
];

// Mock the API module
jest.mock('../../api/companiesApi', () => {
  return {
    companiesApi: {
      getAll: jest.fn().mockResolvedValue(mockCompanies),
      getById: jest.fn().mockImplementation((id) => {
        const company = mockCompanies.find(c => c.id === id);
        return Promise.resolve(company || null);
      }),
      create: jest.fn().mockImplementation((data) => {
        return Promise.resolve({
          id: '3',
          ...data,
          status: data.status || 'published',
          featured: data.featured || false,
          createdAt: '2023-08-01T00:00:00Z',
          updatedAt: '2023-08-01T00:00:00Z'
        });
      }),
      update: jest.fn().mockImplementation((id, data) => {
        const company = mockCompanies.find(c => c.id === id);
        if (!company) return Promise.resolve(null);
        return Promise.resolve({
          ...company,
          ...data,
          updatedAt: '2023-08-15T00:00:00Z'
        });
      }),
      delete: jest.fn().mockResolvedValue(true)
    },
    CompanyInput: {}
  };
});

// Now import the slice after the mock is set up
import { configureStore } from '@reduxjs/toolkit';
import companiesReducer, {
  fetchCompanies,
  fetchCompanyById,
  fetchFilteredCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  setFilters,
  clearFilters
} from '@/features/companies/store/companiesSlice';

// Mock environment variable
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    VITE_USE_SUPABASE: 'true'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('companies slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        companies: companiesReducer
      }
    });
  });

  it('should handle initial state', () => {
    expect(store.getState().companies).toEqual({
      companies: [],
      currentCompany: null,
      filteredCompanies: [],
      filters: {},
      status: 'idle',
      error: null
    });
  });

  it('should handle fetchCompanies', async () => {
    await store.dispatch(fetchCompanies());
    expect(store.getState().companies.status).toBe('succeeded');
    expect(store.getState().companies.companies).toEqual(mockCompanies);
  });

  it('should handle fetchCompanyById', async () => {
    await store.dispatch(fetchCompanyById('1'));
    expect(store.getState().companies.status).toBe('succeeded');
    expect(store.getState().companies.currentCompany).toEqual(mockCompanies[0]);
  });

  it('should handle fetchFilteredCompanies', async () => {
    await store.dispatch(fetchFilteredCompanies({ industries: ['Software'] }));
    expect(store.getState().companies.status).toBe('succeeded');
    expect(store.getState().companies.filteredCompanies).toEqual(mockCompanies);
  });

  it('should handle createCompany', async () => {
    const newCompany = {
      name: 'New Tech Co',
      description: 'A new company',
      logo: 'https://example.com/logo3.jpg',
      industry: ['Hardware'],
      size: '1-10',
      founded: '2023',
      location: 'Kelowna, BC',
      website: 'https://newtechco.com'
    };
    
    await store.dispatch(createCompany(newCompany));
    expect(store.getState().companies.companies).toHaveLength(1);
    expect(store.getState().companies.companies[0].id).toBe('3');
    expect(store.getState().companies.companies[0].name).toBe('New Tech Co');
  });

  it('should handle updateCompany', async () => {
    // First fetch companies to populate the state
    await store.dispatch(fetchCompanies());
    
    // Then update one company
    const updateData = {
      description: 'Updated description',
      featured: true
    };
    
    await store.dispatch(updateCompany({ id: '1', data: updateData }));
    
    const updatedCompany = store.getState().companies.companies.find(c => c.id === '1');
    expect(updatedCompany).toBeTruthy();
    expect(updatedCompany?.description).toBe('Updated description');
    expect(updatedCompany?.featured).toBe(true);
  });

  it('should handle deleteCompany', async () => {
    // First fetch companies to populate the state
    await store.dispatch(fetchCompanies());
    expect(store.getState().companies.companies).toHaveLength(2);
    
    // Then delete one company
    await store.dispatch(deleteCompany('1'));
    
    expect(store.getState().companies.companies).toHaveLength(1);
    expect(store.getState().companies.companies[0].id).toBe('2');
  });

  it('should handle setFilters', () => {
    store.dispatch(setFilters({ search: 'tech', industries: ['Software'] }));
    expect(store.getState().companies.filters).toEqual({
      search: 'tech',
      industries: ['Software']
    });
  });

  it('should handle clearFilters', () => {
    // First set some filters
    store.dispatch(setFilters({ search: 'tech', industries: ['Software'] }));
    
    // Then clear them
    store.dispatch(clearFilters());
    
    expect(store.getState().companies.filters).toEqual({});
  });
});
