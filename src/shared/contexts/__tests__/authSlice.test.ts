/**
 * @jest-environment jsdom
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer, { 
  signInWithSession, 
  signOut,
  updateSession,
  setRoles,
  setAuthError
} from '../../redux/slices/authSlice';

// Mock user and session data
const mockUser = {
  id: 'mock-user-id',
  email: 'test@example.com',
  role: 'authenticated'
};

const mockSession = {
  access_token: 'mock-access-token',
  expires_at: '2023-01-01T00:00:00.000Z'
};

// Create test store
function createTestStore() {
  return configureStore({
    reducer: { auth: authReducer }
  });
}

describe('Auth Slice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().auth;
    expect(state.status).toBe('idle');
    expect(state.user).toBe(null);
    expect(state.session).toBe(null);
    expect(state.error).toBe(null);
    expect(state.roles.list).toEqual([]);
    expect(state.roles.isAdmin).toBe(false);
  });

  it('should handle signInWithSession action', async () => {
    // Dispatch the sign in action
    await store.dispatch(signInWithSession({
      user: mockUser,
      session: mockSession
    }));

    // Verify state is updated correctly
    const state = store.getState().auth;
    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(expect.objectContaining({
      id: mockUser.id,
      email: mockUser.email
    }));
    expect(state.session).toEqual(expect.objectContaining({
      access_token: mockSession.access_token
    }));
    // Check role handling
    expect(state.roles.list).toEqual(['authenticated']);
    expect(state.roles.isAdmin).toBe(false);
  });

  it('should handle signOut action', async () => {
    // First set up an authenticated state
    await store.dispatch(signInWithSession({
      user: mockUser,
      session: mockSession
    }));
    
    // Verify user is authenticated
    expect(store.getState().auth.status).toBe('authenticated');
    
    // Dispatch the sign out action
    await store.dispatch(signOut());
    
    // Verify state is reset to unauthenticated
    const state = store.getState().auth;
    expect(state.status).toBe('idle');
    expect(state.user).toBe(null);
    expect(state.session).toBe(null);
  });

  it('should handle updateSession action', () => {
    // Initial state should not be authenticated
    expect(store.getState().auth.status).toBe('idle');
    
    // Update with a new session
    const newSession = { 
      access_token: 'new-token', 
      expires_at: '2023-02-01T00:00:00.000Z' 
    };
    store.dispatch(updateSession(newSession));
    
    // Session should be updated but status should stay idle without user
    expect(store.getState().auth.session).toEqual(newSession);
    expect(store.getState().auth.status).toBe('idle');
  });

  it('should handle setRoles action', async () => {
    // First sign in to set up context
    await store.dispatch(signInWithSession({
      user: mockUser,
      session: mockSession
    }));
    
    // Dispatch setRoles with admin privilege
    store.dispatch(setRoles(['authenticated', 'admin']));
    
    // Verify roles are updated
    const state = store.getState().auth;
    expect(state.roles.list).toEqual(['authenticated', 'admin']);
    expect(state.roles.isAdmin).toBe(true);
    expect(state.roles.loading).toBe(false);
  });

  it('should handle setAuthError action', () => {
    // Dispatch error action
    store.dispatch(setAuthError('Authentication failed'));
    
    // Verify error state is set
    const state = store.getState().auth;
    expect(state.error).toBe('Authentication failed');
    expect(state.status).toBe('error');
  });
});
