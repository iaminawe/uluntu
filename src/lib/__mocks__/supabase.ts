// src/lib/__mocks__/supabase.ts
// Type import only for the return type
import type { SupabaseClient } from '@supabase/supabase-js';

// Create a mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: jest.fn().mockResolvedValue({
      data: { user: { id: 'mock-user-id', email: 'test@example.com' }, session: { access_token: 'mock-token', expires_at: new Date().toISOString() } },
      error: null
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: { id: 'mock-user-id', email: 'test@example.com' }, session: { access_token: 'mock-token', expires_at: new Date().toISOString() } },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'mock-user-id', email: 'test@example.com' } },
      error: null
    }),
    getSession: jest.fn().mockResolvedValue({
      data: { session: { access_token: 'mock-token', expires_at: new Date().toISOString() } },
      error: null
    }),
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
      upload: jest.fn().mockResolvedValue({ data: { path: 'mock-path' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://mock-storage.com/mock-path' } }),
    }),
  },
};

// Export the mock client
export const supabase = mockSupabaseClient as unknown as SupabaseClient;

// Export helper functions that use the mock client
export const checkSupabaseConnection = jest.fn().mockResolvedValue(true);

export const signUp = jest.fn().mockImplementation(async (email: string, password: string) => {
  return mockSupabaseClient.auth.signUp({ email, password });
});

export const signIn = jest.fn().mockImplementation(async (email: string, password: string) => {
  return mockSupabaseClient.auth.signInWithPassword({ email, password });
});

export const signOut = jest.fn().mockImplementation(async () => {
  return mockSupabaseClient.auth.signOut();
});

export const getCurrentUser = jest.fn().mockImplementation(async () => {
  return { user: null, error: null };
});

export const getSession = jest.fn().mockImplementation(async () => {
  return mockSupabaseClient.auth.getSession();
});

export const uploadProfileImage = jest.fn().mockImplementation(
  async (_file: File, userId: string) => ({
    url: `https://mock-storage.com/${userId}/profile.jpg`,
    error: null
  })
);

export const uploadCoverImage = jest.fn().mockImplementation(
  async (_file: File, userId: string) => ({
    url: `https://mock-storage.com/${userId}/cover.jpg`,
    error: null
  })
);

export const forgotPassword = jest.fn().mockImplementation(async (_email: string) => ({
  success: true,
  error: null
}));

export const resetPassword = jest.fn().mockImplementation(async (_newPassword: string) => ({
  success: true,
  error: null
}));
