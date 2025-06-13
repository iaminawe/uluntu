import { Member } from '../../types';

// Mock Supabase client
export const supabase = {
  auth: {
    signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
  },
};

// Mock membersApi
export const membersApi = {
  create: jest.fn().mockResolvedValue({ id: 'test-member-id' } as Member),
  getAll: jest.fn().mockResolvedValue([]),
  getById: jest.fn().mockResolvedValue(null),
  update: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue(true),
};