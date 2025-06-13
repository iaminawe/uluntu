import { createContext, useContext, ReactNode, useEffect } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { useAuth as useReduxAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/shared/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ data: { session: Session | null; user: User | null } | null; error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ data: { session: Session | null; user: User | null } | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error: Error | AuthError | null }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error: Error | AuthError | null }>;
  userRoles: string[];
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>({} as AuthContextType);

// Development bypass for authentication (same as in original AuthContext)
const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true' && import.meta.env.DEV;
const DEV_USER = {
  id: 'dev-user-id',
  email: 'dev@example.com',
  user_metadata: { name: 'Development User' },
};

/**
 * AuthProvider that integrates with Redux
 * 
 * This provider maintains backward compatibility with the existing AuthContext
 * while using Redux for state management
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const reduxAuth = useReduxAuth();
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  
  // Map Redux state to AuthContext
  const user = authState.user ? 
    {
      id: authState.user.id,
      email: authState.user.email,
      user_metadata: { 
        role: authState.user.role,
        name: authState.user.name || null
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: '',
      updated_at: '',
      identities: [],
      factors: []
    } as User : null;
  
  const session = authState.session ? 
    {
      access_token: authState.session.access_token,
      refresh_token: '',
      expires_at: new Date(authState.session.expires_at).getTime(),
      expires_in: 3600,
      token_type: 'bearer',
      user: user as User
    } as Session : null;
  
  const loading = authState.status === 'loading';
  const error = authState.error ? new Error(authState.error) : null;
  
  // Map Redux roles to userRoles
  const userRoles = authState.roles?.list || [];
  const isAdmin = authState.roles?.isAdmin || false;

  // Forward Redux auth functions to maintain the same API
  const signIn = reduxAuth.signIn;
  const signUp = reduxAuth.signUp;
  const signOut = reduxAuth.signOut;
  
  // Implement missing functions for compatibility
  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { success: !error, error };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };
  
  const resetPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { success: !error, error };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  const value = {
    session,
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    userRoles,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook that connects to the Redux-based AuthContext
 * 
 * This maintains the same API as the original useAuth hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  // In development mode, provide a bypass for authentication (same as original)
  if (DEV_BYPASS_AUTH && import.meta.env.DEV) {
    // Create a safe context object that handles the undefined case
    const safeContext: AuthContextType = context || {
      session: null,
      user: null,
      loading: false,
      error: null,
      signIn: async () => ({ data: null, error: null }),
      signUp: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      userRoles: [],
      isAdmin: false,
      forgotPassword: async () => ({ success: true, error: null }),
      resetPassword: async () => ({ success: true, error: null })
    };
    
    return {
      ...safeContext,
      // Override sign-in to always succeed in development
      signIn: async (_email: string, _password: string, _rememberMe?: boolean) => ({
        data: { session: { user: DEV_USER }, user: DEV_USER },
        error: null
      }),
      // Add mock implementations for password reset functions
      forgotPassword: async () => ({ success: true, error: null }),
      resetPassword: async () => ({ success: true, error: null }),
      // Make sure user is always set in development
      user: DEV_USER,
      isAdmin: true,
      userRoles: ['admin', 'user'],
      loading: false
    };
  }
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
