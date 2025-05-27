import { configureStore } from '@reduxjs/toolkit';
import opportunitiesReducer, {
  OpportunitiesState,
  fetchOpportunities,
  fetchOpportunityById,
  fetchFilteredOpportunities,
  fetchFeaturedOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  setFilters,
  clearFilters
} from './opportunitiesSlice';

// Mock data
const mockOpportunities = [
  {
    id: '1',
    title: 'Senior Developer',
    description: 'Senior developer role',
    type: 'full-time',
    location: 'Nelson, BC',
    remote: true,
    status: 'published',
    featured: true,
    company: {
      id: '1',
      name: 'Tech Company',
      logo: 'https://example.com/logo.png'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Junior Developer',
    description: 'Junior developer role',
    type: 'part-time',
    location: 'Kelowna, BC',
    remote: false,
    status: 'published',
    featured: false,
    company: {
      id: '2',
      name: 'Another Tech Company',
      logo: 'https://example.com/logo2.png'
    },
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z'
  }
];

// Mock API functions
jest.mock('../../api/opportunitiesApi', () => ({
  opportunitiesApi: {
    getAll: jest.fn().mockImplementation((filters) => {
      if (filters?.type) {
        return Promise.resolve(mockOpportunities.filter(opp => filters.type.includes(opp.type)));
      }
      return Promise.resolve(mockOpportunities);
    }),
    getById: jest.fn().mockImplementation((id) => {
      const opportunity = mockOpportunities.find(opp => opp.id === id);
      return Promise.resolve(opportunity || null);
    }),
    getFeatured: jest.fn().mockImplementation((limit) => {
      return Promise.resolve(mockOpportunities.filter(opp => opp.featured).slice(0, limit || 3));
    }),
    getByCompany: jest.fn().mockImplementation((companyId) => {
      return Promise.resolve(mockOpportunities.filter(opp => opp.company.id === companyId));
    }),
    create: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        id: '3',
        ...data,
        createdAt: '2023-01-03T00:00:00Z',
        updatedAt: '2023-01-03T00:00:00Z',
        status: data.status || 'published'
      });
    }),
    update: jest.fn().mockImplementation((id, data) => {
      const opportunity = mockOpportunities.find(opp => opp.id === id);
      if (!opportunity) return Promise.resolve(null);
      return Promise.resolve({
        ...opportunity,
        ...data,
        updatedAt: '2023-01-04T00:00:00Z'
      });
    }),
    delete: jest.fn().mockResolvedValue(true)
  },
  OpportunityInput: {}
}));

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

describe('opportunities slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        opportunities: opportunitiesReducer
      }
    });
  });

  it('should handle initial state', () => {
    expect(store.getState().opportunities).toEqual({
      opportunities: [],
      currentOpportunity: null,
      filteredOpportunities: [],
      featuredOpportunities: [],
      companyOpportunities: [],
      filters: {},
      status: 'idle',
      error: null
    });
  });

  it('should handle fetchOpportunities', async () => {
    await store.dispatch(fetchOpportunities());
    expect(store.getState().opportunities.status).toBe('succeeded');
    expect(store.getState().opportunities.opportunities).toEqual(mockOpportunities);
  });

  it('should handle fetchOpportunityById', async () => {
    await store.dispatch(fetchOpportunityById('1'));
    expect(store.getState().opportunities.status).toBe('succeeded');
    expect(store.getState().opportunities.currentOpportunity).toEqual(mockOpportunities[0]);
  });

  it('should handle fetchFilteredOpportunities', async () => {
    await store.dispatch(fetchFilteredOpportunities({ type: ['full-time'] }));
    expect(store.getState().opportunities.status).toBe('succeeded');
    expect(store.getState().opportunities.filteredOpportunities).toEqual([mockOpportunities[0]]);
  });

  it('should handle fetchFeaturedOpportunities', async () => {
    await store.dispatch(fetchFeaturedOpportunities());
    expect(store.getState().opportunities.status).toBe('succeeded');
    expect(store.getState().opportunities.featuredOpportunities).toEqual([mockOpportunities[0]]);
  });

  it('should handle createOpportunity', async () => {
    const newOpportunity = {
      title: 'New Opportunity',
      description: 'A new opportunity',
      type: 'contract',
      location: 'Remote',
      company: {
        id: '1',
        name: 'Tech Company',
        logo: 'https://example.com/logo.png'
      }
    };
    
    await store.dispatch(createOpportunity(newOpportunity));
    
    expect(store.getState().opportunities.opportunities.length).toBe(1);
    expect(store.getState().opportunities.opportunities[0].title).toBe('New Opportunity');
  });

  it('should handle updateOpportunity', async () => {
    // First fetch opportunities to populate the state
    await store.dispatch(fetchOpportunities());
    
    // Then update one opportunity
    const updateData = {
      title: 'Updated Title',
      description: 'Updated description'
    };
    
    await store.dispatch(updateOpportunity({ id: '1', data: updateData }));
    
    const updatedOpportunity = store.getState().opportunities.opportunities.find(opp => opp.id === '1');
    expect(updatedOpportunity).toBeTruthy();
    expect(updatedOpportunity?.title).toBe('Updated Title');
    expect(updatedOpportunity?.description).toBe('Updated description');
  });

  it('should handle deleteOpportunity', async () => {
    // First fetch opportunities to populate the state
    await store.dispatch(fetchOpportunities());
    expect(store.getState().opportunities.opportunities.length).toBe(2);
    
    // Then delete one opportunity
    await store.dispatch(deleteOpportunity('1'));
    
    expect(store.getState().opportunities.opportunities.length).toBe(1);
    expect(store.getState().opportunities.opportunities[0].id).toBe('2');
  });

  it('should handle setFilters', () => {
    store.dispatch(setFilters({ search: 'developer', type: ['full-time'] }));
    expect(store.getState().opportunities.filters).toEqual({
      search: 'developer',
      type: ['full-time']
    });
  });

  it('should handle clearFilters', () => {
    // First set some filters
    store.dispatch(setFilters({ search: 'developer', type: ['full-time'] }));
    
    // Then clear them
    store.dispatch(clearFilters());
    
    expect(store.getState().opportunities.filters).toEqual({});
  });
});
