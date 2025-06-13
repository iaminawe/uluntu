// Mock the supabase module before any imports
jest.mock('../../lib/supabase', () => {
  const mockSupabaseClient = {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: {
          subscription: {
            id: 'mock-sub-id',
            unsubscribe: jest.fn()
          }
        }
      }),
      signInWithPassword: jest.fn(),
      signOut: jest.fn()
    }
  };
  
  return {
    supabase: mockSupabaseClient,
    checkSupabaseConnection: jest.fn().mockResolvedValue(true)
  };
});

// Now import dependencies
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';
import { SessionProvider } from '@/shared/contexts/SessionContextWithRedux';
import { useAuth } from '@/features/auth/hooks/useAuth';

describe('useAuth Hook with SessionContext and Redux', () => {
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

  it('should render the hook without errors', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Verify that the hook returns the expected structure
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('session');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('signIn');
    expect(result.current).toHaveProperty('signOut');
    expect(result.current).toHaveProperty('hasRole');
  });

  it('should have expected initial state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Verify initial state
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should have a signIn method', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Verify signIn method exists and is a function
    expect(typeof result.current.signIn).toBe('function');
  });

  it('should have a signOut method', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Verify signOut method exists and is a function
    expect(typeof result.current.signOut).toBe('function');
  });

  it('should have a hasRole method', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Verify hasRole method exists and is a function
    expect(typeof result.current.hasRole).toBe('function');
    
    // Test hasRole with no user (should return false)
    expect(result.current.hasRole('admin')).toBe(false);
  });
});