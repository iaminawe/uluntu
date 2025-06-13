import { configureStore } from '@reduxjs/toolkit';
import groupsReducer, {
  GroupsState,
  fetchGroups,
  fetchGroupById,
  fetchFilteredGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  setFilters,
  clearFilters
} from '@/features/groups/store/groupsSlice';

// Mock data
const mockGroups = [
  {
    id: '1',
    name: 'Kootenay Tech Meetup',
    description: 'A community of tech professionals in the Kootenay region.',
    longDescription: 'Our mission is to connect tech professionals in the Kootenay region to share knowledge, collaborate on projects, and build a strong tech community.',
    heroImage: 'https://example.com/tech-meetup.jpg',
    visibility: 'open',
    status: 'published',
    featured: true,
    members: [
      { id: '1', name: 'John Doe', role: 'admin' },
      { id: '2', name: 'Jane Smith', role: 'member' }
    ],
    events: [],
    resources: []
  },
  {
    id: '2',
    name: 'Kootenay Web Developers',
    description: 'A group for web developers in the Kootenay area.',
    longDescription: 'We focus on web development technologies and best practices. Join us for regular code sessions, learning workshops, and networking events.',
    heroImage: 'https://example.com/web-dev.jpg',
    visibility: 'closed',
    status: 'published',
    featured: false,
    members: [
      { id: '3', name: 'Alice Johnson', role: 'admin' },
      { id: '4', name: 'Bob Brown', role: 'member' }
    ],
    events: [],
    resources: []
  }
];

// Mock API functions
jest.mock('../../api/groupsApi', () => ({
  groupsApi: {
    getAll: jest.fn().mockImplementation((filters) => {
      if (filters?.visibility) {
        return Promise.resolve(mockGroups.filter(group => filters.visibility.includes(group.visibility)));
      }
      if (filters?.search) {
        return Promise.resolve(mockGroups.filter(group => 
          group.name.toLowerCase().includes(filters.search.toLowerCase()) || 
          group.description.toLowerCase().includes(filters.search.toLowerCase())
        ));
      }
      return Promise.resolve(mockGroups);
    }),
    getById: jest.fn().mockImplementation((id) => {
      const group = mockGroups.find(group => group.id === id);
      return Promise.resolve(group || null);
    }),
    create: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        id: '3',
        ...data,
        status: data.status || 'published',
        featured: data.featured || false,
        members: [],
        events: [],
        resources: []
      });
    }),
    update: jest.fn().mockImplementation((id, data) => {
      const group = mockGroups.find(group => group.id === id);
      if (!group) return Promise.resolve(null);
      return Promise.resolve({
        ...group,
        ...data
      });
    }),
    delete: jest.fn().mockResolvedValue(true)
  },
  GroupInput: {}
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

describe('groups slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        groups: groupsReducer
      }
    });
  });

  it('should handle initial state', () => {
    expect(store.getState().groups).toEqual({
      groups: [],
      currentGroup: null,
      filteredGroups: [],
      filters: {},
      status: 'idle',
      error: null
    });
  });

  it('should handle fetchGroups', async () => {
    await store.dispatch(fetchGroups());
    expect(store.getState().groups.status).toBe('succeeded');
    expect(store.getState().groups.groups).toEqual(mockGroups);
  });

  it('should handle fetchGroupById', async () => {
    await store.dispatch(fetchGroupById('1'));
    expect(store.getState().groups.status).toBe('succeeded');
    expect(store.getState().groups.currentGroup).toEqual(mockGroups[0]);
  });

  it('should handle fetchFilteredGroups with visibility filter', async () => {
    await store.dispatch(fetchFilteredGroups({ visibility: ['closed'] }));
    expect(store.getState().groups.status).toBe('succeeded');
    expect(store.getState().groups.filteredGroups).toEqual([mockGroups[1]]);
  });

  it('should handle fetchFilteredGroups with search filter', async () => {
    await store.dispatch(fetchFilteredGroups({ search: 'web' }));
    expect(store.getState().groups.status).toBe('succeeded');
    expect(store.getState().groups.filteredGroups).toEqual([mockGroups[1]]);
  });

  it('should handle createGroup', async () => {
    const newGroup = {
      name: 'New Tech Group',
      description: 'A new tech group description',
      heroImage: 'https://example.com/new-group.jpg',
      visibility: 'open',
      longDescription: 'This is a longer description of the new tech group'
    };
    
    await store.dispatch(createGroup(newGroup));
    expect(store.getState().groups.groups.length).toBe(1);
    expect(store.getState().groups.groups[0].name).toBe('New Tech Group');
    expect(store.getState().groups.groups[0].id).toBe('3');
  });

  it('should handle updateGroup', async () => {
    // First fetch groups to populate the state
    await store.dispatch(fetchGroups());
    
    // Then update one group
    const updateData = {
      name: 'Updated Group Name',
      description: 'Updated group description'
    };
    
    await store.dispatch(updateGroup({ id: '1', data: updateData }));
    
    const updatedGroup = store.getState().groups.groups.find(group => group.id === '1');
    expect(updatedGroup).toBeTruthy();
    expect(updatedGroup?.name).toBe('Updated Group Name');
    expect(updatedGroup?.description).toBe('Updated group description');
  });

  it('should handle deleteGroup', async () => {
    // First fetch groups to populate the state
    await store.dispatch(fetchGroups());
    expect(store.getState().groups.groups.length).toBe(2);
    
    // Then delete one group
    await store.dispatch(deleteGroup('1'));
    
    expect(store.getState().groups.groups.length).toBe(1);
    expect(store.getState().groups.groups[0].id).toBe('2');
  });

  it('should handle setFilters', () => {
    store.dispatch(setFilters({ search: 'tech', visibility: ['open'] }));
    expect(store.getState().groups.filters).toEqual({
      search: 'tech',
      visibility: ['open']
    });
  });

  it('should handle clearFilters', () => {
    // First set some filters
    store.dispatch(setFilters({ search: 'tech', visibility: ['open'] }));
    
    // Then clear them
    store.dispatch(clearFilters());
    
    expect(store.getState().groups.filters).toEqual({});
  });
});
