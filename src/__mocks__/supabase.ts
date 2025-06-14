import { createClient } from '@supabase/supabase-js';

// Create a mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => callback({ data: [], error: null })),
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    }),
  },
};

// Export the mock client
export const supabase = mockSupabaseClient as unknown as ReturnType<typeof createClient>;

// Mock helper functions
export const checkSupabaseConnection = jest.fn().mockResolvedValue(true);
export const signUp = jest.fn();
export const signIn = jest.fn();
export const signOut = jest.fn();
export const getCurrentUser = jest.fn();
export const getSession = jest.fn();
export const uploadProfileImage = jest.fn();
export const uploadCoverImage = jest.fn();