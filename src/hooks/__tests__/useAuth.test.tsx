import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { User, Session } from '../../redux/slices/authSlice';
import { mockSupabaseClient } from '../../__mocks__/supabaseClient';

// Mock the actual Supabase client module before importing useAuth
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient
}));

// Import useAuth after mocking Supabase
import { useAuth } from '../useAuth';

// Setup test environment for React 18
import { createRoot } from 'react-dom/client';
const container = document.createElement('div');
const root = createRoot(container);

describe('useAuth Hook with Redux', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    role: 'user'
  };

  const mockSession: Session = {
    access_token: 'mock-token',
    expires_at: new Date().toISOString()
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const store = configureStore({
      reducer: { auth: authReducer }
    });
    return <Provider store={store}>{children}</Provider>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    root.unmount();
  });

  describe('Sign In', () => {
    it('should handle successful sign in', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { 
          user: { 
            id: mockUser.id,
            email: mockUser.email,
            user_metadata: { role: mockUser.role }
          },
          session: { 
            access_token: mockSession.access_token,
            expires_at: new Date(mockSession.expires_at).getTime()
          }
        },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle sign in error', async () => {
      const mockError = { message: 'Invalid credentials' };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signIn('test@example.com', 'wrong-password');
      });

      expect(result.current.error).toBe(mockError.message);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('Sign Up', () => {
    it('should handle successful sign up', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { 
          user: { 
            id: mockUser.id,
            email: mockUser.email,
            user_metadata: { role: mockUser.role }
          },  
          session: {
            access_token: mockSession.access_token,
            expires_at: new Date(mockSession.expires_at).getTime()
          }
        },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signUp('test@example.com', 'password');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle sign up error', async () => {
      const mockError = { message: 'Email already exists' };
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signUp('existing@example.com', 'password');
      });

      expect(result.current.error).toBe(mockError.message);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Sign Out', () => {
    it('should handle successful sign out', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // First sign in
      await act(async () => {
        result.current.setSession({ user: mockUser, session: mockSession });
      });

      // Then sign out
      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle sign out error', async () => {
      const mockError = { message: 'Network error' };
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: mockError });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('Password Reset', () => {
    it('should handle successful password reset request', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValueOnce({
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(result.current.error).toBeNull();
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
    });

    it('should handle password reset error', async () => {
      const mockError = { message: 'User not found' };
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValueOnce({
        error: mockError
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.resetPassword('nonexistent@example.com');
      });

      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('Session Management', () => {
    it('should handle session refresh', async () => {
      const newSession = {
        access_token: 'new-token',
        expires_at: new Date().toISOString()
      };

      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { 
          session: {
            access_token: newSession.access_token,
            expires_at: new Date(newSession.expires_at).getTime()
          }
        },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refreshSession();
      });

      expect(result.current.session).toEqual(newSession);
    });

    it('should handle expired session', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refreshSession();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.session).toBeNull();
    });
  });

  describe('Role-based Access Control', () => {
    it('should check user role permissions', async () => {
      const adminUser = { ...mockUser, role: 'admin' };

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        result.current.setSession({ user: adminUser, session: mockSession });
      });

      expect(result.current.user?.role).toBe('admin');
      expect(result.current.hasRole('admin')).toBe(true);
      expect(result.current.hasRole('user')).toBe(false);
    });
  });
});