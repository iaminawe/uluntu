import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

/**
 * Authentication hook with role-based access control
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });
  
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (mounted) {
          setState({
            user: session?.user || null,
            session,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (mounted) {
          setState({
            user: null,
            session: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Authentication error'
          });
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setState({
            user: session?.user || null,
            session,
            loading: false,
            error: null
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user roles when user changes
  useEffect(() => {
    const fetchUserRoles = async (userId: string) => {
      setRolesLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (error) {
          console.warn('Failed to fetch user roles:', error.message);
          setUserRoles([]);
        } else {
          setUserRoles(data?.map(r => r.role) || []);
        }
      } catch (error) {
        console.warn('Error fetching user roles:', error);
        setUserRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    if (state.user?.id) {
      fetchUserRoles(state.user.id);
    } else {
      setUserRoles([]);
      setRolesLoading(false);
    }
  }, [state.user?.id]);

  // Computed values
  const isAuthenticated = useMemo(() => {
    return !!state.user && !!state.session;
  }, [state.user, state.session]);

  const hasRole = useMemo(() => {
    return (role: string) => userRoles.includes(role);
  }, [userRoles]);

  const hasAnyRole = useMemo(() => {
    return (roles: string[]) => roles.some(role => userRoles.includes(role));
  }, [userRoles]);

  const hasAllRoles = useMemo(() => {
    return (roles: string[]) => roles.every(role => userRoles.includes(role));
  }, [userRoles]);

  const isAdmin = useMemo(() => {
    return hasRole('admin') || hasRole('super_admin');
  }, [hasRole]);

  const isModerator = useMemo(() => {
    return hasRole('moderator') || isAdmin;
  }, [hasRole, isAdmin]);

  return {
    // State
    user: state.user,
    session: state.session,
    loading: state.loading || rolesLoading,
    error: state.error,
    
    // Role information
    userRoles,
    rolesLoading,
    
    // Computed values
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isModerator
  };
}

export default useAuth;