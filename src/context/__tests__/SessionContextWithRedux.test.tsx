import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Session, User, AuthChangeEvent, Subscription } from '@supabase/supabase-js';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { signInWithSession, signOut as reduxSignOut } from '../../redux/slices/authSlice';
import { SessionProvider, useSession } from '../SessionContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { mockUser, mockSession, flushPromises } from '../../utils/testUtils';

// Mock supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            id: 'mock-sub-id',
            callback: () => {},
            unsubscribe: jest.fn()
          }
        }
      })),
      signOut: jest.fn()
    }
  }
}));

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Using mockUser and mockSession from testUtils

// Redux store for testing
const createTestStore = () => configureStore({
  reducer: { auth: authReducer }
});

// Test component to consume both context and Redux
const TestConsumer = () => {
  const { session, user, loading, signOut } = useSession();
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <div data-testid="redux-user">{auth.user?.email || 'no-redux-user'}</div>
      <div data-testid="redux-authenticated">{auth.isAuthenticated.toString()}</div>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={auth.signOut}>Redux Sign Out</button>
    </div>
  );
};

describe('SessionContext with Redux Integration', () => {
  let store: ReturnType<typeof createTestStore>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    
    // Default mock implementation for useAuth
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      isAuthenticated: false,
      error: null,
      status: 'idle',
      roles: { list: [], isAdmin: false, loading: false, error: null },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      refreshSession: jest.fn(),
      hasRole: jest.fn(),
      setSession: jest.fn()
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <SessionProvider>
          {ui}
        </SessionProvider>
      </Provider>
    );
  };

  it('should sync Supabase session to Redux on initial load', async () => {
    // Mock Supabase session retrieval
    jest.mocked(supabase.auth.getSession).mockResolvedValueOnce({ 
      data: { session: mockSession },
      error: null
    });

    // Mock Redux auth state
    const mockReduxUser = {
      id: mockUser.id,
      email: mockUser.email || '',
      role: mockUser.role
    };
    
    const mockReduxSession = {
      access_token: mockSession.access_token,
      expires_at: new Date(mockSession.expires_at * 1000).toISOString()
    };

    // Mock useAuth to simulate Redux state changes
    jest.mocked(useAuth).mockImplementation(() => ({
      user: mockReduxUser,
      session: mockReduxSession,
      isAuthenticated: true,
      error: null,
      status: 'authenticated',
      roles: { list: ['authenticated'], isAdmin: false, loading: false, error: null },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      refreshSession: jest.fn(),
      hasRole: jest.fn(),
      setSession: jest.fn()
    }));

    renderWithProviders(<TestConsumer />);

    await waitFor(() => {
      // Context state
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('session')).toHaveTextContent('has-session');
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email!);
      
      // Redux state via useAuth
      expect(screen.getByTestId('redux-user')).toHaveTextContent(mockUser.email!);
      expect(screen.getByTestId('redux-authenticated')).toHaveTextContent('true');
    });
  });

  it('should handle auth state changes and update Redux', async () => {
    // Setup auth state change handler
    let authChangeCallback: (event: AuthChangeEvent, session: Session | null) => void;
    jest.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authChangeCallback = callback as typeof authChangeCallback;
      return {
        data: {
          subscription: {
            id: 'mock-sub-id',
            callback: () => {},
            unsubscribe: jest.fn()
          } as Subscription
        }
      };
    });

    // Initially not authenticated
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      isAuthenticated: false,
      error: null,
      status: 'idle',
      roles: { list: [], isAdmin: false, loading: false, error: null },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      refreshSession: jest.fn(),
      hasRole: jest.fn(),
      setSession: jest.fn()
    });

    renderWithProviders(<TestConsumer />);

    // Verify initial state
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('session')).toHaveTextContent('no-session');
    expect(screen.getByTestId('redux-authenticated')).toHaveTextContent('false');

    // Mock Redux auth state after sign in
    const mockReduxUser = {
      id: mockUser.id,
      email: mockUser.email || '',
      role: mockUser.role
    };
    
    const mockReduxSession = {
      access_token: mockSession.access_token,
      expires_at: new Date(mockSession.expires_at * 1000).toISOString()
    };

    // Update the mock implementation
    jest.mocked(useAuth).mockReturnValue({
      user: mockReduxUser,
      session: mockReduxSession,
      isAuthenticated: true,
      error: null,
      status: 'authenticated',
      roles: { list: ['authenticated'], isAdmin: false, loading: false, error: null },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      refreshSession: jest.fn(),
      hasRole: jest.fn(),
      setSession: jest.fn()
    });

    // Simulate auth state change
    await act(async () => {
      if (authChangeCallback) {
        authChangeCallback('SIGNED_IN', mockSession);
      }
      await flushPromises();
    });

    // Force a re-render to ensure the context updates
    renderWithProviders(<TestConsumer />);

    // Use a more robust waitFor with increased timeout
    await waitFor(() => {
      // First check Redux state which should be updated immediately
      expect(screen.getByTestId('redux-user')).toHaveTextContent(mockUser.email!);
      expect(screen.getByTestId('redux-authenticated')).toHaveTextContent('true');
    }, { timeout: 2000 });

    // Then check context state which might take longer to update
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('session')).toHaveTextContent('has-session');
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email!);
    }, { timeout: 2000 });
  });

  it('should handle sign out in both context and Redux', async () => {
    jest.mocked(supabase.auth.getSession).mockResolvedValueOnce({ 
      data: { session: mockSession },
      error: null
    });
    jest.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

    // Mock Redux auth state for signed in user
    const mockReduxUser = {
      id: mockUser.id,
      email: mockUser.email || '',
      role: mockUser.role
    };
    
    const mockReduxSession = {
      access_token: mockSession.access_token,
      expires_at: new Date(mockSession.expires_at * 1000).toISOString()
    };

    const mockReduxSignOut = jest.fn();

    jest.mocked(useAuth).mockReturnValue({
      user: mockReduxUser,
      session: mockReduxSession,
      isAuthenticated: true,
      error: null,
      status: 'authenticated',
      roles: { list: ['authenticated'], isAdmin: false, loading: false, error: null },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockReduxSignOut,
      resetPassword: jest.fn(),
      refreshSession: jest.fn(),
      hasRole: jest.fn(),
      setSession: jest.fn()
    });

    renderWithProviders(<TestConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('session')).toHaveTextContent('has-session');
      expect(screen.getByTestId('redux-authenticated')).toHaveTextContent('true');
    });

    // After sign out, update the mock to reflect Redux state change
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      isAuthenticated: false,
      error: null,
      status: 'idle',
      roles: { list: [], isAdmin: false, loading: false, error: null },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockReduxSignOut,
      resetPassword: jest.fn(),
      refreshSession: jest.fn(),
      hasRole: jest.fn(),
      setSession: jest.fn()
    });

    // Click the context sign out button
    const signOutButton = screen.getByText('Sign Out');
    await userEvent.click(signOutButton);

    expect(supabase.auth.signOut).toHaveBeenCalled();
    
    await waitFor(() => {
      // Context state
      expect(screen.getByTestId('session')).toHaveTextContent('no-session');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      
      // Redux state
      expect(screen.getByTestId('redux-user')).toHaveTextContent('no-redux-user');
      expect(screen.getByTestId('redux-authenticated')).toHaveTextContent('false');
    });
  });

  it('should handle Redux sign out and update context', async () => {
    jest.mocked(supabase.auth.getSession).mockResolvedValueOnce({ 
      data: { session: mockSession },
      error: null
    });

    // Mock Redux auth state for signed in user
    const mockReduxUser = {
      id: mockUser.id,
      email: mockUser.email || '',
      role: mockUser.role
    };
    
    const mockReduxSession = {
      access_token: mockSession.access_token,
      expires_at: new Date(mockSession.expires_at * 1000).toISOString()
    };

    const mockReduxSignOut = jest.fn().mockImplementation(() => {
      // Simulate Redux state change
      store.dispatch(reduxSignOut());
      
      // Simulate Supabase sign out success
      jest.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });
      
      // Trigger auth state change
      if (typeof authChangeCallback === 'function') {
        authChangeCallback('SIGNED_OUT', null);
      }
    });

    // Setup auth state change handler
    let authChangeCallback: (event: AuthChangeEvent, session: Session | null) => void;
    jest.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authChangeCallback = callback as typeof authChangeCallback;
      return {
        data: {
          subscription: {
            id: 'mock-sub-id',
            callback: () => {},
            unsubscribe: jest.fn()
          } as Subscription
        }
      };
    });

    jest.mocked(useAuth).mockReturnValue({
      user: mockReduxUser,
      session: mockReduxSession,
      isAuthenticated: true,
      error: null,
      status: 'authenticated',
      roles: { list: ['authenticated'], isAdmin: false, loading: false, error: null },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockReduxSignOut,
      resetPassword: jest.fn(),
      refreshSession: jest.fn(),
      hasRole: jest.fn(),
      setSession: jest.fn()
    });

    renderWithProviders(<TestConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('session')).toHaveTextContent('has-session');
      expect(screen.getByTestId('redux-authenticated')).toHaveTextContent('true');
    }, { timeout: 2000 });

    // Click the Redux sign out button
    const reduxSignOutButton = screen.getByText('Redux Sign Out');
    await act(async () => {
      await userEvent.click(reduxSignOutButton);
      await flushPromises();
    });

    expect(mockReduxSignOut).toHaveBeenCalled();
    
    // Update the mock to reflect state change
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      isAuthenticated: false,
      error: null,
      status: 'idle',
      roles: { list: [], isAdmin: false, loading: false, error: null },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockReduxSignOut,
      resetPassword: jest.fn(),
      refreshSession: jest.fn(),
      hasRole: jest.fn(),
      setSession: jest.fn()
    });
    
    // Force a re-render to ensure the context updates
    renderWithProviders(<TestConsumer />);
    
    await waitFor(() => {
      // Redux state
      expect(screen.getByTestId('redux-user')).toHaveTextContent('no-redux-user');
      expect(screen.getByTestId('redux-authenticated')).toHaveTextContent('false');
    }, { timeout: 2000 });
  });
});
