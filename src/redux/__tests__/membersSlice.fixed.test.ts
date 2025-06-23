// Mock environment dependencies first
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: { getUser: jest.fn() }
  },
  sessionCache: new WeakMap()
}));

jest.mock('@/config/env', () => ({
  getIsSupabaseEnabled: jest.fn().mockReturnValue(false),
  IS_SUPABASE_ENABLED: false
}));

import { configureStore } from '@reduxjs/toolkit';
import membersReducer, {
  fetchMembers,
  fetchMemberById,
  fetchFilteredMembers,
  createMember,
  updateMember,
  deleteMember,
  setFilters,
  clearFilters,
  clearMembers
} from '@/features/directory/store/membersSlice';
import { ContentStatus } from '../../types/common';

// Mock the API calls
jest.mock('../../features/directory/api/membersApi', () => ({
  membersApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Get the mocked API module
const membersApiMock = require('../../api/membersApi').membersApi;

// Mock the environment variable
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv, VITE_USE_SUPABASE: 'true' }; // Set to true to use the API path
  
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  process.env = originalEnv;
});

// Create a mock store for testing
const createTestStore = () => {
  return configureStore({
    reducer: {
      members: membersReducer,
    },
  });
};

// Sample member data - structured to match the expected output after adaptMember is applied
const mockMember = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  bio: 'Software developer with 5 years of experience',
  image: 'john-doe.jpg',
  role: 'Senior Developer', // role matches title after adaptation
  title: 'Senior Developer',
  skills: ['JavaScript', 'React', 'Node.js'],
  joinDate: '2023-01-01T00:00:00.000Z',
  joinedDate: '2023-01-01T00:00:00.000Z', // Added to match adapter output
  status: 'published' as ContentStatus,
  featured: true,
  company: undefined, // Added to match adapter output
  created_at: undefined // Added to match adapter output
};

const mockMembers = [
  mockMember,
  {
    ...mockMember,
    id: '2',
    name: 'Jane Smith',
    role: 'UI/UX Designer', // role matches title after adaptation
    title: 'UI/UX Designer',
    skills: ['UI/UX', 'Figma', 'Sketch']
  }
];

describe('Members Slice', () => {
  describe('Reducers', () => {
    test('should handle initial state', () => {
      const store = createTestStore();
      expect(store.getState().members).toEqual({
        members: [],
        currentMember: null,
        filteredMembers: [],
        filters: {},
        status: 'idle',
        error: null
      });
    });

    test('should handle setFilters', () => {
      const store = createTestStore();
      const filters = { search: 'test', skills: ['JavaScript'] };
      store.dispatch(setFilters(filters));
      expect(store.getState().members.filters).toEqual(filters);
    });

    test('should handle clearFilters', () => {
      const store = createTestStore();
      const filters = { search: 'test', skills: ['JavaScript'] };
      store.dispatch(setFilters(filters));
      store.dispatch(clearFilters());
      expect(store.getState().members.filters).toEqual({});
    });

    test('should handle clearMembers', () => {
      const store = createTestStore();
      // Setup initial state with members
      store.dispatch({ 
        type: fetchMembers.fulfilled.type, 
        payload: mockMembers 
      });
      expect(store.getState().members.members).toHaveLength(2);
      
      // Clear members
      store.dispatch(clearMembers());
      expect(store.getState().members.members).toEqual([]);
      expect(store.getState().members.filteredMembers).toEqual([]);
      expect(store.getState().members.currentMember).toBeNull();
    });
  });

  describe('Async thunks', () => {
    test('fetchMembers should update state correctly on success', async () => {
      const store = createTestStore();
      
      // Mock implementation for fetchMembers
      membersApiMock.getAll.mockResolvedValueOnce(mockMembers);
      
      await store.dispatch(fetchMembers());
      
      expect(store.getState().members.status).toEqual('succeeded');
      expect(store.getState().members.members).toEqual(mockMembers);
      expect(store.getState().members.error).toBeNull();
    });

    test('fetchMemberById should update state correctly on success', async () => {
      const store = createTestStore();
      
      // Mock implementation for fetchMemberById
      membersApiMock.getById.mockResolvedValueOnce(mockMember);
      
      await store.dispatch(fetchMemberById('1'));
      
      expect(store.getState().members.status).toEqual('succeeded');
      expect(store.getState().members.currentMember).toEqual(mockMember);
      expect(store.getState().members.error).toBeNull();
    });

    test('fetchFilteredMembers should update state correctly on success', async () => {
      const store = createTestStore();
      const filters = { search: 'John', skills: ['JavaScript'] };
      
      // Mock implementation for fetchFilteredMembers
      membersApiMock.getAll.mockResolvedValueOnce([mockMember]);
      
      await store.dispatch(fetchFilteredMembers(filters));
      
      expect(store.getState().members.status).toEqual('succeeded');
      expect(store.getState().members.filteredMembers).toEqual([mockMember]);
      expect(store.getState().members.error).toBeNull();
    });

    test('createMember should add a member to the state on success', async () => {
      const store = createTestStore();
      const newMemberData = {
        name: 'New Member',
        bio: 'New Member Bio',
        title: 'New Role',
        status: 'published' as ContentStatus
      };
      
      const createdMember = {
        id: '3',
        ...newMemberData,
        email: 'new.member@example.com',
        image: '',
        skills: [],
        joinDate: new Date().toISOString()
      };
      
      // Mock implementation for createMember
      membersApiMock.create.mockResolvedValueOnce(createdMember);
      
      await store.dispatch(createMember(newMemberData as any));
      
      expect(store.getState().members.status).toEqual('succeeded');
      expect(store.getState().members.members).toHaveLength(1);
      expect(store.getState().members.members[0].name).toEqual('New Member');
    });

    test('updateMember should update a member in the state on success', async () => {
      const store = createTestStore();
      
      // Setup initial state with a member
      store.dispatch({ 
        type: fetchMembers.fulfilled.type, 
        payload: [mockMember] 
      });
      
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated Bio'
      };
      
      const updatedMember = {
        ...mockMember,
        ...updateData
      };
      
      // Mock implementation for updateMember
      membersApiMock.update.mockResolvedValueOnce(updatedMember);
      
      await store.dispatch(updateMember({ id: '1', data: updateData }));
      
      expect(store.getState().members.status).toEqual('succeeded');
      expect(store.getState().members.members[0].name).toEqual('Updated Name');
      expect(store.getState().members.members[0].bio).toEqual('Updated Bio');
    });

    test('deleteMember should remove a member from the state on success', async () => {
      const store = createTestStore();
      
      // Setup initial state with members
      store.dispatch({ 
        type: fetchMembers.fulfilled.type, 
        payload: mockMembers 
      });
      expect(store.getState().members.members).toHaveLength(2);
      
      // Mock implementation for deleteMember
      membersApiMock.delete.mockResolvedValueOnce(true);
      
      await store.dispatch(deleteMember('1'));
      
      expect(store.getState().members.status).toEqual('succeeded');
      expect(store.getState().members.members).toHaveLength(1);
      expect(store.getState().members.members[0].id).toEqual('2');
    });
  });
});
