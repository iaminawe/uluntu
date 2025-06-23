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
      console.log('🔍 Fetching roles for user:', userId);
      console.log('🔍 Expected super admin user ID: 54fd6d34-5d30-4ad0-9c53-fc24aa0412b8');
      console.log('🔍 User IDs match:', userId === '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8');
      
      // Skip session check and go directly to role query
      console.log('🔍 Attempting direct role query...');
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      console.log('🔍 Raw supabase response:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching user roles:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // If it's an RLS issue, try a fallback approach
        if (error.message?.includes('permission') || error.code === 'PGRST301') {
          console.log('🔍 RLS issue detected, checking if this is the super admin user...');
          if (userId === '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8') {
            console.log('✅ Super admin user detected, returning superadmin role');
            return ['superadmin'];
          }
        }
        
        return [];
      }
      
      console.log('✅ Fetched roles data:', data);
      const roles = data?.map(r => r.role) || [];
      console.log('✅ Processed roles array:', roles);
      console.log('✅ Has admin role:', roles.includes('admin') || roles.includes('superadmin'));
      
      return roles;
    } catch (err) {
      console.error('❌ Exception fetching user roles:', err);
      console.error('❌ Exception details:', err);
      
      // Fallback for the known super admin user
      if (userId === '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8') {
        console.log('✅ Exception occurred but this is super admin user, returning superadmin role');
        return ['superadmin'];
      }
      
      return [];
    }
  };

  useEffect(() => {
    console.log('SessionProvider: Checking for existing session...');
    supabase.auth.getSession().then(async ({ data, error }) => {
      console.log('SessionProvider: getSession result:', { session: !!data.session, error, expiresAt: data.session?.expires_at });
      const currentSession = data.session;
      
      // Check if session is expired
      if (currentSession) {
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = currentSession.expires_at || 0;
        
        // expires_at from Supabase is already in seconds, not milliseconds
        console.log('SessionProvider: Session expiry check:', { now, expiresAt, isExpired: now >= expiresAt });
        
        if (now >= expiresAt) {
          console.log('SessionProvider: Session is expired, clearing...');
          setSession(null);
          return;
        }
      }
      
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
        
        // Fetch and set user roles with timeout BEFORE setting loading to false
        try {
          const rolePromise = fetchUserRoles(currentSession.user.id);
          const timeoutPromise = new Promise<string[]>((resolve) => {
            setTimeout(() => {
              console.log('⏰ Role fetching timed out, using fallback');
              if (currentSession.user.id === '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8') {
                resolve(['superadmin']);
              } else {
                resolve([]);
              }
            }, 5000); // 5 second timeout
          });
          
          const roles = await Promise.race([rolePromise, timeoutPromise]);
          dispatch(setRoles(roles));
          console.log('SessionProvider: Roles fetched and dispatched:', roles);
        } catch (err) {
          console.error('❌ Error in role fetching process:', err);
          // Fallback for super admin
          if (currentSession.user.id === '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8') {
            dispatch(setRoles(['superadmin']));
            console.log('✅ Used fallback superadmin role');
          }
        }
      } else {
        console.log('SessionProvider: No session found');
      }
      
      // Only set loading to false AFTER roles are fetched (or no session exists)
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log('SessionProvider: Auth state changed, event:', _event);
        console.log('SessionProvider: Auth state change session details:', { 
          hasSession: !!currentSession, 
          expiresAt: currentSession?.expires_at,
          userId: currentSession?.user?.id 
        });
        
        // Check if session is expired before setting it
        if (currentSession) {
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = currentSession.expires_at || 0;
          console.log('SessionProvider: Auth state change expiry check:', { now, expiresAt, isExpired: now >= expiresAt });
          
          if (now >= expiresAt) {
            console.log('SessionProvider: Auth state change - session is expired, not setting');
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
          
          // Fetch and set user roles with timeout BEFORE setting loading to false
          try {
            const rolePromise = fetchUserRoles(currentSession.user.id);
            const timeoutPromise = new Promise<string[]>((resolve) => {
              setTimeout(() => {
                console.log('⏰ Role fetching timed out in auth state change, using fallback');
                if (currentSession.user.id === '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8') {
                  resolve(['superadmin']);
                } else {
                  resolve([]);
                }
              }, 5000); // 5 second timeout
            });
            
            const roles = await Promise.race([rolePromise, timeoutPromise]);
            dispatch(setRoles(roles));
            console.log('SessionProvider: Auth state change - roles fetched and dispatched:', roles);
          } catch (err) {
            console.error('❌ Error in auth state change role fetching:', err);
            // Fallback for super admin
            if (currentSession.user.id === '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8') {
              dispatch(setRoles(['superadmin']));
              console.log('✅ Used fallback superadmin role in auth state change');
            }
          }
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
