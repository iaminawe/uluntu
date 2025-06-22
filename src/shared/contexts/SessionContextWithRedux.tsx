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
}

const SessionContext = createContext<SessionContext>({
  session: null,
  user: null,
  loading: true,
  signOut: () => Promise.resolve()
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
      console.log('Fetching roles for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      console.log('Fetched roles:', data);
      const roles = data?.map(r => r.role) || [];
      console.log('Processed roles:', roles);
      return roles;
    } catch (err) {
      console.error('Exception fetching user roles:', err);
      return [];
    }
  };

  useEffect(() => {
    console.log('SessionProvider: Checking for existing session...');
    supabase.auth.getSession().then(async ({ data, error }) => {
      console.log('SessionProvider: getSession result:', { session: data.session, error });
      const currentSession = data.session;
      setSession(currentSession);
      
      // Sync with Redux store
      if (currentSession) {
        console.log('SessionProvider: Session found, syncing with Redux');
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
        
        // Fetch and set user roles BEFORE setting loading to false
        const roles = await fetchUserRoles(currentSession.user.id);
        dispatch(setRoles(roles));
        console.log('SessionProvider: Roles fetched and dispatched, now setting loading to false');
      } else {
        console.log('SessionProvider: No session found');
      }
      
      // Only set loading to false AFTER roles are fetched (or no session exists)
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log('SessionProvider: Auth state changed, event:', _event);
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
          
          // Fetch and set user roles BEFORE setting loading to false
          const roles = await fetchUserRoles(currentSession.user.id);
          dispatch(setRoles(roles));
          console.log('SessionProvider: Auth state change - roles fetched and dispatched');
        } else {
          dispatch(reduxSignOut());
        }
        
        // Only set loading to false AFTER roles are fetched
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

  return (
    <SessionContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signOut
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
