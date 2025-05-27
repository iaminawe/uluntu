import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../redux/slices/authSlice';
import { AuthProvider, useAuth } from '../AuthContextWithRedux';
import { mockSupabaseClient } from '../../__mocks__/supabaseClient';

// Mock the Supabase client
jest.mock('../../lib/supabase', () => ({
  __esModule: true,
  supabase: mockSupabaseClient,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  checkSupabaseConnection: jest.fn().mockResolvedValue(true),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn()
}));

// Create a test component to consume AuthContext
const TestAuthConsumer = () => {
  const { user, isAuthenticated, signIn, signOut, error } = useAuth();
  
  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="error">{error?.message || 'No error'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
};

describe('AuthContextWithRedux', () => {
  const createTestStore = () => configureStore({
    reducer: { auth: authReducer }
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    const store = createTestStore();
    return {
      ...render(
        <Provider store={store}>
          <AuthProvider>
            {ui}
          </AuthProvider>
        </Provider>
      ),
      store
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide initial auth state from Redux store', async () => {
    renderWithProviders(<TestAuthConsumer />);
    
    expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('should handle successful sign in', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { role: 'user' }
    };
    
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_at: 1234567890,
      user: mockUser
    };
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: mockUser,
        session: mockSession
      },
      error: null
    });
    
    renderWithProviders(<TestAuthConsumer />);
    
    const signInButton = screen.getByText('Sign In');
    await act(async () => {
      userEvent.click(signInButton);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
    
    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('should handle sign in error', async () => {
    const mockError = { message: 'Invalid credentials' };
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: mockError
    });
    
    renderWithProviders(<TestAuthConsumer />);
    
    const signInButton = screen.getByText('Sign In');
    await act(async () => {
      userEvent.click(signInButton);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('should handle sign out', async () => {
    // First sign in
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { role: 'user' }
    };
    
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_at: 1234567890,
      user: mockUser
    };
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: mockUser,
        session: mockSession
      },
      error: null
    });
    
    mockSupabaseClient.auth.signOut.mockResolvedValueOnce({
      error: null
    });
    
    renderWithProviders(<TestAuthConsumer />);
    
    // Sign in first
    const signInButton = screen.getByText('Sign In');
    await act(async () => {
      userEvent.click(signInButton);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
    
    // Then sign out
    const signOutButton = screen.getByText('Sign Out');
    await act(async () => {
      userEvent.click(signOutButton);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });
    
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
  });

  it('should handle role-based permissions', async () => {
    // Test component specifically for role checking
    const TestRoleConsumer = () => {
      const { userRoles, isAdmin } = useAuth();
      
      return (
        <div>
          <div data-testid="roles">{userRoles.join(',')}</div>
          <div data-testid="is-admin">{isAdmin.toString()}</div>
        </div>
      );
    };
    
    // Mock user with admin role
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      user_metadata: { role: 'admin' }
    };
    
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_at: 1234567890,
      user: mockUser
    };
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: mockUser,
        session: mockSession
      },
      error: null
    });
    
    // Mock roles returned from the database
    mockSupabaseClient.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValueOnce({
          data: [{ role: 'admin' }, { role: 'user' }],
          error: null
        })
      })
    });
    
    const { store } = renderWithProviders(<TestRoleConsumer />);
    
    // Simulate setting roles in Redux directly
    await act(async () => {
      store.dispatch({
        type: 'auth/setRoles',
        payload: ['admin', 'user']
      });
      
      store.dispatch({
        type: 'auth/signInWithSession',
        payload: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            role: 'admin'
          },
          session: {
            access_token: mockSession.access_token,
            expires_at: new Date(mockSession.expires_at * 1000).toISOString()
          }
        }
      });
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('admin,user');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    });
  });
});
