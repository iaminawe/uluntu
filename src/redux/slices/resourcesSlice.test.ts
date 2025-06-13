import { configureStore } from '@reduxjs/toolkit';
import resourcesReducer, {
  ResourcesState,
  fetchResources,
  fetchResourceById,
  fetchFilteredResources,
  fetchGroupResources,
  createResource,
  updateResource,
  deleteResource,
  setFilters,
  clearFilters
} from '@/features/resources/store/resourcesSlice';

// Mock data
const mockResources = [
  {
    id: '1',
    title: 'Intro to AI Ethics',
    description: 'A comprehensive guide to ethical considerations in AI development.',
    type: 'document',
    url: 'https://example.com/ai-ethics-guide',
    status: 'published',
    featured: true,
    contributor: {
      id: '1',
      name: 'Sarah Johnson'
    },
    dateAdded: '2023-01-01T00:00:00Z',
    tags: ['AI', 'Ethics']
  },
  {
    id: '2',
    title: 'Machine Learning Workshop Recording',
    description: 'Recording of our February workshop on practical ML applications.',
    type: 'video',
    url: 'https://example.com/ml-workshop',
    status: 'published',
    featured: false,
    contributor: {
      id: '2',
      name: 'Michael Chen'
    },
    dateAdded: '2023-02-15T00:00:00Z',
    tags: ['Machine Learning', 'Workshop', 'Video']
  }
];

// Mock API functions
jest.mock('../../api/resourcesApi', () => ({
  resourcesApi: {
    getAll: jest.fn().mockImplementation((filters) => {
      if (filters?.types) {
        return Promise.resolve(mockResources.filter(res => filters.types.includes(res.type)));
      }
      return Promise.resolve(mockResources);
    }),
    getById: jest.fn().mockImplementation((id) => {
      const resource = mockResources.find(res => res.id === id);
      return Promise.resolve(resource || null);
    }),
    getByGroup: jest.fn().mockImplementation((groupId) => {
      return Promise.resolve(mockResources.filter(res => res.groupId === groupId));
    }),
    create: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        id: '3',
        ...data,
        status: data.status || 'published',
        featured: data.featured || false,
        dateAdded: new Date().toISOString(),
        tags: data.tags || []
      });
    }),
    update: jest.fn().mockImplementation((id, data) => {
      const resource = mockResources.find(res => res.id === id);
      if (!resource) return Promise.resolve(null);
      return Promise.resolve({
        ...resource,
        ...data,
        dateAdded: resource.dateAdded
      });
    }),
    delete: jest.fn().mockResolvedValue(true)
  },
  ResourceInput: {}
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

describe('resources slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        resources: resourcesReducer
      }
    });
  });

  it('should handle initial state', () => {
    expect(store.getState().resources).toEqual({
      resources: [],
      currentResource: null,
      filteredResources: [],
      groupResources: [],
      filters: {},
      status: 'idle',
      error: null
    });
  });

  it('should handle fetchResources', async () => {
    await store.dispatch(fetchResources());
    expect(store.getState().resources.status).toBe('succeeded');
    expect(store.getState().resources.resources).toEqual(mockResources);
  });

  it('should handle fetchResourceById', async () => {
    await store.dispatch(fetchResourceById('1'));
    expect(store.getState().resources.status).toBe('succeeded');
    expect(store.getState().resources.currentResource).toEqual(mockResources[0]);
  });

  it('should handle fetchFilteredResources', async () => {
    await store.dispatch(fetchFilteredResources({ types: ['document'] }));
    expect(store.getState().resources.status).toBe('succeeded');
    expect(store.getState().resources.filteredResources).toEqual([mockResources[0]]);
  });

  it('should handle createResource', async () => {
    const newResource = {
      title: 'New Resource',
      description: 'A new resource description.',
      type: 'article',
      url: 'https://example.com/new-resource',
      contributorId: '1',
      tags: ['New', 'Article']
    };
    
    await store.dispatch(createResource(newResource));
    expect(store.getState().resources.resources.length).toBe(1);
    expect(store.getState().resources.resources[0].title).toBe('New Resource');
    expect(store.getState().resources.resources[0].id).toBe('3');
  });

  it('should handle updateResource', async () => {
    // First fetch resources to populate the state
    await store.dispatch(fetchResources());
    
    // Then update one resource
    const updateData = {
      title: 'Updated Title',
      description: 'Updated description'
    };
    
    await store.dispatch(updateResource({ id: '1', data: updateData }));
    
    const updatedResource = store.getState().resources.resources.find(res => res.id === '1');
    expect(updatedResource).toBeTruthy();
    expect(updatedResource?.title).toBe('Updated Title');
    expect(updatedResource?.description).toBe('Updated description');
  });

  it('should handle deleteResource', async () => {
    // First fetch resources to populate the state
    await store.dispatch(fetchResources());
    expect(store.getState().resources.resources.length).toBe(2);
    
    // Then delete one resource
    await store.dispatch(deleteResource('1'));
    
    expect(store.getState().resources.resources.length).toBe(1);
    expect(store.getState().resources.resources[0].id).toBe('2');
  });

  it('should handle setFilters', () => {
    store.dispatch(setFilters({ search: 'AI', types: ['document'] }));
    expect(store.getState().resources.filters).toEqual({
      search: 'AI',
      types: ['document']
    });
  });

  it('should handle clearFilters', () => {
    // First set some filters
    store.dispatch(setFilters({ search: 'AI', types: ['document'] }));
    
    // Then clear them
    store.dispatch(clearFilters());
    
    expect(store.getState().resources.filters).toEqual({});
  });
});
