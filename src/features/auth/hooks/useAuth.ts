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
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { supabase } from '@/lib/supabase';
import { sessionCache } from '@/lib/supabase';

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
      if (!supabase || !supabase.auth) {
        dispatch(setAuthError('Authentication service unavailable'));
        return;
      }

      const response = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!response) {
        dispatch(setAuthError('Invalid response from authentication service'));
        return;
      }

      const { data, error } = response;

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

        // Role fetching is handled by SessionContextWithRedux
      } else {
        dispatch(setAuthError('Incomplete authentication data'));
      }
    } catch (err) {
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
        return { error };
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
      
      return { data };
    } catch (err) {
      handleAuthError(dispatch, err);
      return { error: err };
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
        return { error };
      }
      
      return { success: true };
    } catch (err) {
      handleAuthError(dispatch, err);
      return { error: err };
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

  /**
   * @deprecated Use `usePermissions()` hook instead for role checking
   * This method checks user.role which may be undefined. Use the modern permission system instead.
   */
  const hasRole = (role: string) => {
    return user?.role === role;
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
    forgotPassword: resetPassword,
    resetPassword,
    refreshSession,
    hasRole
  };
};