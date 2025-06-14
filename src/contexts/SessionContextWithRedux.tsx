import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useDispatch } from "react-redux";
import { supabase } from '@/lib/supabase';
import { signInWithSession, signOut as reduxSignOut, updateSession as updateReduxSession } from '@/features/auth/store/authSlice';

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentSession = data.session;
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
      }
      
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
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
        } else {
          dispatch(reduxSignOut());
        }
        
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
