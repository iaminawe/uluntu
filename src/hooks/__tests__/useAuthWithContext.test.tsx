import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../redux/slices/authSlice';
import { SessionProvider } from '../../context/SessionContextWithRedux';
import { mockSupabaseClient } from '../../__mocks__/supabaseClient';

// Mock the actual Supabase client module before importing useAuth
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient
}));

// Mock the supabase client in the SessionContext
jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabaseClient
}));

// Import useAuth after mocking Supabase
import { useAuth } from '../useAuth';

describe('useAuth Hook with SessionContext and Redux', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    role: 'user'
  };

  const mockSession = {
    access_token: 'mock-token',
    expires_at: new Date().toISOString()
  };

  // Create a wrapper with both Redux and SessionContext
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const store = configureStore({
      reducer: { auth: authReducer }
    });
    return (
      <Provider store={store}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sync auth state between context and Redux', async () => {
    // Mock Supabase session retrieval for SessionContext
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
      data: { 
        session: { 
          access_token: mockSession.access_token,
          expires_at: new Date(mockSession.expires_at).getTime() / 1000,
          user: { 
            id: mockUser.id,
            email: mockUser.email,
            user_metadata: { role: mockUser.role }
          },
          refresh_token: 'mock-refresh',
          token_type: 'bearer',
          expires_in: 3600
        }
      },
      error: null
    });

    // Mock auth state change subscription
    mockSupabaseClient.auth.onAuthStateChange.mockReturnValueOnce({
      data: {
        subscription: {
          id: 'mock-sub-id',
          unsubscribe: jest.fn()
        }
      }
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the SessionContext to initialize and sync with Redux
    await waitForNextUpdate();

    // Verify that Redux state has been updated via SessionContext
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle sign out in both context and Redux', async () => {
    // Mock Supabase session retrieval for SessionContext
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
      data: { 
        session: { 
          access_token: mockSession.access_token,
          expires_at: new Date(mockSession.expires_at).getTime() / 1000,
          user: { 
            id: mockUser.id,
            email: mockUser.email,
            user_metadata: { role: mockUser.role }
          },
          refresh_token: 'mock-refresh',
          token_type: 'bearer',
          expires_in: 3600
        }
      },
      error: null
    });

    // Mock auth state change subscription
    mockSupabaseClient.auth.onAuthStateChange.mockReturnValueOnce({
      data: {
        subscription: {
          id: 'mock-sub-id',
          unsubscribe: jest.fn()
        }
      }
    });

    // Mock successful sign out
    mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: null });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the SessionContext to initialize and sync with Redux
    await waitForNextUpdate();

    // Verify initial authenticated state
    expect(result.current.isAuthenticated).toBe(true);

    // Sign out
    await act(async () => {
      await result.current.signOut();
    });

    // Verify that both context and Redux state have been updated
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
  });

  it('should handle sign in and update both context and Redux', async () => {
    // Initial state - not authenticated
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null
    });

    // Mock auth state change subscription
    mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
      // Store callback to trigger auth state change later
      (mockSupabaseClient as any)._authCallback = callback;
      return {
        data: {
          subscription: {
            id: 'mock-sub-id',
            unsubscribe: jest.fn()
          }
        }
      };
    });

    // Mock successful sign in
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { 
        user: { 
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: { role: mockUser.role }
        },
        session: { 
          access_token: mockSession.access_token,
          expires_at: new Date(mockSession.expires_at).getTime() / 1000,
          refresh_token: 'mock-refresh',
          token_type: 'bearer',
          expires_in: 3600,
          user: { 
            id: mockUser.id,
            email: mockUser.email,
            user_metadata: { role: mockUser.role }
          }
        }
      },
      error: null
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the SessionContext to initialize
    await waitForNextUpdate();

    // Verify initial unauthenticated state
    expect(result.current.isAuthenticated).toBe(false);

    // Sign in
    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    // Simulate auth state change from Supabase
    if ((mockSupabaseClient as any)._authCallback) {
      act(() => {
        (mockSupabaseClient as any)._authCallback('SIGNED_IN', {
          access_token: mockSession.access_token,
          expires_at: new Date(mockSession.expires_at).getTime() / 1000,
          refresh_token: 'mock-refresh',
          token_type: 'bearer',
          expires_in: 3600,
          user: { 
            id: mockUser.id,
            email: mockUser.email,
            user_metadata: { role: mockUser.role }
          }
        });
      });
    }

    // Verify that both context and Redux state have been updated
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('should handle role-based permissions', async () => {
    const adminUser = {
      id: '123',
      email: 'admin@example.com',
      role: 'admin'
    };

    // Mock Supabase session retrieval for SessionContext with admin role
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
      data: { 
        session: { 
          access_token: mockSession.access_token,
          expires_at: new Date(mockSession.expires_at).getTime() / 1000,
          user: { 
            id: adminUser.id,
            email: adminUser.email,
            user_metadata: { role: adminUser.role }
          },
          refresh_token: 'mock-refresh',
          token_type: 'bearer',
          expires_in: 3600
        }
      },
      error: null
    });

    // Mock auth state change subscription
    mockSupabaseClient.auth.onAuthStateChange.mockReturnValueOnce({
      data: {
        subscription: {
          id: 'mock-sub-id',
          unsubscribe: jest.fn()
        }
      }
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the SessionContext to initialize and sync with Redux
    await waitForNextUpdate();

    // Verify that role information is correctly set in Redux
    expect(result.current.user?.role).toBe('admin');
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('user')).toBe(false);
  });
});
