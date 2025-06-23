import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useDispatch } from "react-redux";
import { supabase } from "@/lib/supabase";
import { signInWithSession, signOut as reduxSignOut, updateSession as updateReduxSession, setRoles } from "@/features/auth/store/authSlice";

type SessionContext = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error: Error | null }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error: Error | null }>;
}

const SessionContext = createContext<SessionContext>({
  session: null,
  user: null,
  loading: true,
  signOut: () => Promise.resolve(),
  forgotPassword: () => Promise.resolve({ success: false, error: new Error('Not implemented') }),
  resetPassword: () => Promise.resolve({ success: false, error: new Error('Not implemented') })
});

/**
 * SessionProvider that integrates with Redux
 * 
 * This provider maintains backward compatibility with the context API
 * while also syncing auth state with Redux
 */
export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Function to fetch user roles from the database
  const fetchUserRoles = async (userId: string) => {
    try {
      const superAdminId = import.meta.env.VITE_SUPER_ADMIN_USER_ID;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user roles:', error.message);
        
        // If it's an RLS issue, try a fallback approach
        if (error.message?.includes('permission') || error.code === 'PGRST301') {
          const superAdminId = import.meta.env.VITE_SUPER_ADMIN_USER_ID;
          if (superAdminId && userId === superAdminId) {
            return ['superadmin'];
          }
        }
        
        return [];
      }
      
      const roles = data?.map(r => r.role) || [];
      return roles;
    } catch (err) {
      console.error('Exception fetching user roles:', err);
      
      // Fallback for the known super admin user
      const superAdminId = import.meta.env.VITE_SUPER_ADMIN_USER_ID;
      if (superAdminId && userId === superAdminId) {
        return ['superadmin'];
      }
      
      return [];
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data, error }) => {
      const currentSession = data.session;
      
      // Check if session is expired
      if (currentSession) {
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = currentSession.expires_at || 0;
        
        // expires_at from Supabase is already in seconds, not milliseconds
        if (now >= expiresAt) {
          setSession(null);
          return;
        }
      }
      
      setSession(currentSession);
      
      // Sync with Redux store
      if (currentSession) {
        dispatch(signInWithSession({
          user: {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            role: currentSession.user.user_metadata?.role
          },
          session: {
            access_token: currentSession.access_token,
            expires_at: new Date(currentSession.expires_at * 1000).toISOString()
          }
        }));
        
        // Fetch roles asynchronously (non-blocking)
        fetchUserRoles(currentSession.user.id)
          .then(roles => {
            dispatch(setRoles(roles));
          })
          .catch(err => {
            console.error('Error in role fetching process:', err);
            // Fallback for super admin
            const superAdminId = import.meta.env.VITE_SUPER_ADMIN_USER_ID;
            if (superAdminId && currentSession.user.id === superAdminId) {
              dispatch(setRoles(['superadmin']));
            } else {
              dispatch(setRoles([]));
            }
          });
      }
      
      // Set loading to false immediately (don't wait for roles)
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        
        // Check if session is expired before setting it
        if (currentSession) {
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = currentSession.expires_at || 0;
          if (now >= expiresAt) {
            setSession(null);
            dispatch(reduxSignOut());
            setLoading(false);
            return;
          }
        }
        
        setSession(currentSession);
        
        // Sync with Redux store
        if (currentSession) {
          dispatch(signInWithSession({
            user: {
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              role: currentSession.user.user_metadata?.role
            },
            session: {
              access_token: currentSession.access_token,
              expires_at: new Date(currentSession.expires_at * 1000).toISOString()
            }
          }));
          
          // Fetch roles asynchronously (non-blocking)
          fetchUserRoles(currentSession.user.id)
            .then(roles => {
              dispatch(setRoles(roles));
            })
            .catch(err => {
              console.error('Error in auth state change role fetching:', err);
              // Fallback for super admin
              const superAdminId = import.meta.env.VITE_SUPER_ADMIN_USER_ID;
              if (superAdminId && currentSession.user.id === superAdminId) {
                dispatch(setRoles(['superadmin']));
              } else {
                dispatch(setRoles([]));
              }
            });
        } else {
          dispatch(reduxSignOut());
        }
        
        // Set loading to false immediately (don't wait for roles)
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, [dispatch]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    dispatch(reduxSignOut());
  };

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { success: !error, error: error ? new Error(error.message) : null };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  const resetPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { success: !error, error: error ? new Error(error.message) : null };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signOut,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
