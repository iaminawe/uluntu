import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import authReducer, {
  signIn,
  signOut,
  updateSession,
  setAuthError,
  resetAuthState,
  AuthState
} from '../slices/authSlice';

describe('Auth Redux State Tests', () => {
  let store: EnhancedStore<{ auth: AuthState }>;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer }
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        session: null,
        status: 'idle',
        error: null,
        roles: {
          list: [],
          isAdmin: false,
          loading: false,
          error: null
        }
      });
    });
  });

  describe('Authentication Actions', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      role: 'user'
    };

    const mockSession = {
      access_token: 'mock-token',
      expires_at: new Date().toISOString()
    };

    it('should handle successful sign in', () => {
      store.dispatch(signIn({ user: mockUser, session: mockSession }));
      
      const state = store.getState().auth;
      expect(state).toEqual({
        user: mockUser,
        session: mockSession,
        status: 'authenticated',
        error: null,
        roles: {
          list: ['user'], // The role from the user is added to the list
          isAdmin: false,
          loading: false, // Loading is set to false after roles are processed
          error: null
        }
      });
    });

    it('should handle sign out', () => {
      // First sign in
      store.dispatch(signIn({ user: mockUser, session: mockSession }));
      
      // Then sign out
      store.dispatch(signOut());
      
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        session: null,
        status: 'idle',
        error: null,
        roles: {
          list: [],
          isAdmin: false,
          loading: false,
          error: null
        }
      });
    });

    it('should handle session updates', () => {
      const newSession = {
        ...mockSession,
        access_token: 'new-token'
      };
      
      store.dispatch(updateSession(newSession));
      
      const state = store.getState().auth;
      expect(state.session).toEqual(newSession);
    });

    it('should handle authentication errors', () => {
      const error = 'Invalid credentials';
      store.dispatch(setAuthError(error));
      
      const state = store.getState().auth;
      expect(state.error).toBe(error);
      expect(state.status).toBe('error');
    });

    it('should reset auth state', () => {
      // First set some state
      store.dispatch(signIn({ user: mockUser, session: mockSession }));
      store.dispatch(setAuthError('Some error'));
      
      // Then reset
      store.dispatch(resetAuthState());
      
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        session: null,
        status: 'idle',
        error: null,
        roles: {
          list: [],
          isAdmin: false,
          loading: false,
          error: null
        }
      });
    });
  });

  describe('Role-based Access Control', () => {
    it('should handle user role in auth state', () => {
      const userWithRole = {
        id: '123',
        email: 'test@example.com',
        role: 'admin'
      };

      store.dispatch(signIn({ 
        user: userWithRole,
        session: { access_token: 'token', expires_at: new Date().toISOString() }
      }));

      const state = store.getState().auth;
      expect(state.user?.role).toBe('admin');
    });

    it('should clear role on sign out', () => {
      const userWithRole = {
        id: '123',
        email: 'test@example.com',
        role: 'admin'
      };

      store.dispatch(signIn({ 
        user: userWithRole,
        session: { access_token: 'token', expires_at: new Date().toISOString() }
      }));
      store.dispatch(signOut());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
    });
  });
});