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
} from '@/features/auth/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { supabase } from '@/lib/supabase';
import { sessionCache } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { logAndSanitizeError } from '@/utils/errorSanitization';

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

const handleAuthError = (dispatch: ReturnType<typeof useAppDispatch>, error: unknown, context: string) => {
  const sanitized = logAndSanitizeError(error, context);
  dispatch(setAuthError(sanitized.userMessage));
};

/**
 * @deprecated This auth hook is deprecated. Please use:
 * - `usePermissions()` from '@/hooks/usePermissions' for role/permission checks
 * - `useSession()` from '@/shared/contexts/SessionContextWithRedux' for user/session data
 * - `useAuth()` from '@/features/auth/hooks/useAuth' for auth operations
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, session, status, error, roles } = useAppSelector(state => state.auth);

  const isAuthenticated = status === 'authenticated';

  const signIn = async (email: string, password: string) => {
    try {
      // Add a safety check before calling signInWithPassword
      if (!supabase || !supabase.auth) {
        const sanitized = logAndSanitizeError('Authentication service not initialized', 'Authentication - Service Check');
        dispatch(setAuthError(sanitized.userMessage));
        return;
      }
      
      // Use a safer approach with explicit error handling
      const response = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Safely destructure with a check
      if (!response) {
        const sanitized = logAndSanitizeError('Invalid authentication response', 'Authentication - Response Check');
        dispatch(setAuthError(sanitized.userMessage));
        return;
      }
      
      const { data, error } = response;

      if (error) {
        const sanitized = logAndSanitizeError(error, 'Authentication - Sign In');
        dispatch(setAuthError(sanitized.userMessage));
        return;
      }

      if (data?.user && data?.session) {
        logger.authEvent('Sign-in successful', { userId: data.user.id });
        dispatch(signInWithSession({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            role: data.user.user_metadata?.role
          },
          session: convertSession(data.session)
        }));
      } else {
        const sanitized = logAndSanitizeError('Incomplete authentication data received', 'Authentication - Data Validation');
        dispatch(setAuthError(sanitized.userMessage));
      }
    } catch (err) {
      handleAuthError(dispatch, err, 'Authentication - Sign In Exception');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        const sanitized = logAndSanitizeError(error, 'Authentication - Sign Up');
        dispatch(setAuthError(sanitized.userMessage));
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
      handleAuthError(dispatch, err, 'Authentication - Sign Up Exception');
    }
  };

  const signOutUser = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        const sanitized = logAndSanitizeError(error, 'Authentication - Sign Out');
        dispatch(setAuthError(sanitized.userMessage));
        return;
      }

      dispatch(signOut());
    } catch (err) {
      handleAuthError(dispatch, err, 'Authentication - Sign Out Exception');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        const sanitized = logAndSanitizeError(error, 'Authentication - Password Reset');
        dispatch(setAuthError(sanitized.userMessage));
        return;
      }
    } catch (err) {
      handleAuthError(dispatch, err, 'Authentication - Password Reset Exception');
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        const sanitized = logAndSanitizeError(error, 'Authentication - Session Refresh');
        dispatch(setAuthError(sanitized.userMessage));
        return;
      }

      if (data?.session) {
        dispatch(updateSessionAction(convertSession(data.session)));
      } else {
        dispatch(signOut());
      }
    } catch (err) {
      handleAuthError(dispatch, err, 'Authentication - Session Refresh Exception');
    }
  };

  /**
   * @deprecated Use `usePermissions()` hook instead for role checking
   */
  const hasRole = (role: string) => {
    console.warn('useAuth.hasRole is deprecated. Use usePermissions() hook instead.');
    return user?.role === role;
  };

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