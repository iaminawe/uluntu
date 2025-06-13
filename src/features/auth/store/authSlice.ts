import {
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';

// Utility function for array comparison
const arrayEquals = (a: string[], b: string[]) => 
  a.length === b.length && a.every((val, idx) => val === b[idx]);

export interface User {
  id: string;
  email: string;
  role?: string;
}

export interface Session {
  access_token: string;
  expires_at: string;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error: string | null;
  roles: {
    list: string[];
    isAdmin: boolean;
    loading: boolean;
    error: string | null;
  };
}

const initialState: AuthState = {
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
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Combined sign in action that handles roles
    signInWithSession(state, action: PayloadAction<{ user: User; session: Session }>) {
      const { user, session } = action.payload;
      state.user = user;
      state.session = session;
      state.status = 'authenticated';
      state.error = null;
      // Pre-emptively set basic role info
      if (user.role) {
        state.roles.list = [user.role];
        state.roles.isAdmin = user.role === 'admin';
        state.roles.loading = false;
      } else {
        state.roles.loading = true;
      }
    },

    // Legacy action maintained for backward compatibility
    signIn(state, action: PayloadAction<{ user: User; session: Session }>) {
      authSlice.caseReducers.signInWithSession(state, action);
    },

    signOut(state) {
      Object.assign(state, initialState);
    },

    updateSession(state, action: PayloadAction<Session | null>) {
      const prevAuthenticated = state.status === 'authenticated';
      state.session = action.payload;
      
      // Only update status if authentication state changes
      if (action.payload === null && prevAuthenticated) {
        state.status = 'idle';
      }
    },

    setAuthError(state, action: PayloadAction<string>) {
      if (state.error !== action.payload) {
        state.error = action.payload;
        state.status = 'error';
      }
    },

    // Optimized role management
    setRoles(state, action: PayloadAction<string[]>) {
      const isAdmin = action.payload.includes('admin');
      // Only update if roles actually changed
      if (state.roles.isAdmin !== isAdmin || !arrayEquals(state.roles.list, action.payload)) {
        state.roles.list = action.payload;
        state.roles.isAdmin = isAdmin;
      }
      state.roles.loading = false;
      state.roles.error = null;
    },

    setRolesError(state, action: PayloadAction<string>) {
      state.roles.error = action.payload;
      state.roles.loading = false;
    },

    resetAuthState(state) {
      Object.assign(state, initialState);
    }
  }
});

export const {
  signInWithSession,
  signIn,
  signOut,
  updateSession,
  setAuthError,
  setRoles,
  setRolesError,
  resetAuthState
} = authSlice.actions;

export default authSlice.reducer;