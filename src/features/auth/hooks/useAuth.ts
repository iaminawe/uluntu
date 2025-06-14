import { Session as SupabaseSession } from '@supabase/supabase-js';
import {
  signInWithSession,
  signOut,
  updateSession as updateSessionAction,
  setAuthError,
  setRoles,
  AuthState,
  User,
  Session
} from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { supabase } from '@/lib/supabase';
import { sessionCache } from '@/lib/supabaseClient';

// Optimized session conversion with caching
const convertSession = (supabaseSession: SupabaseSession): Session => {
  let converted = sessionCache.get(supabaseSession);
  if (!converted) {
    converted = {
      access_token: supabaseSession.access_token,
      expires_at: new Date(supabaseSession.expires_at || 0).toISOString()
    };
    sessionCache.set(supabaseSession, converted);
  }
  return converted;
};

const handleAuthError = (dispatch: ReturnType<typeof useAppDispatch>, error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'An error occurred';
  dispatch(setAuthError(errorMessage));
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, session, status, error, roles } = useAppSelector(state => state.auth);

  const isAuthenticated = status === 'authenticated';

  const signIn = async (email: string, password: string) => {
    try {
      // Log which Supabase client we're using
      console.log('Using Supabase client from:', supabase);
      
      // Add a safety check before calling signInWithPassword
      if (!supabase || !supabase.auth) {
        console.error('Supabase client or auth is not properly initialized');
        dispatch(setAuthError('Authentication service unavailable'));
        return;
      }
      
      // Log the auth object to check its structure
      console.log('Auth object:', supabase.auth);
      
      // Use a safer approach with explicit error handling
      const response = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Log the response to see its structure
      console.log('Sign-in response:', response);
      
      // Safely destructure with a check
      if (!response) {
        console.error('Sign-in response is undefined or null');
        dispatch(setAuthError('Invalid response from authentication service'));
        return;
      }
      
      const { data, error } = response;

      if (error) {
        console.error('Sign-in error:', error);
        dispatch(setAuthError(error.message));
        return;
      }

      if (data?.user && data?.session) {
        console.log('Sign-in successful, user:', data.user.id);
        dispatch(signInWithSession({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            role: data.user.user_metadata?.role
          },
          session: convertSession(data.session)
        }));
      } else {
        console.error('Sign-in data incomplete:', data);
        dispatch(setAuthError('Incomplete authentication data'));
      }
    } catch (err) {
      console.error('Sign-in exception:', err);
      handleAuthError(dispatch, err);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        dispatch(setAuthError(error.message));
        return;
      }

      if (data?.user && data?.session) {
        dispatch(signInWithSession({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            role: data.user.user_metadata?.role
          },
          session: convertSession(data.session)
        }));
      }
    } catch (err) {
      handleAuthError(dispatch, err);
    }
  };

  const signOutUser = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        dispatch(setAuthError(error.message));
        return;
      }

      dispatch(signOut());
    } catch (err) {
      handleAuthError(dispatch, err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        dispatch(setAuthError(error.message));
        return;
      }
    } catch (err) {
      handleAuthError(dispatch, err);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        dispatch(setAuthError(error.message));
        return;
      }

      if (data?.session) {
        dispatch(updateSessionAction(convertSession(data.session)));
      } else {
        dispatch(signOut());
      }
    } catch (err) {
      handleAuthError(dispatch, err);
    }
  };

  const hasRole = (role: string) => user?.role === role;

  // For testing purposes
  const setSession = (data: { user: User; session: Session }) => {
    dispatch(signInWithSession(data));
  };

  return {
    user,
    session,
    isAuthenticated,
    error,
    status,
    roles,
    signIn,
    signUp,
    signOut: signOutUser,
    resetPassword,
    refreshSession,
    hasRole,
    setSession
  };
};