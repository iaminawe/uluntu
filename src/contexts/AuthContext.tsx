import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, checkSupabaseConnection, forgotPassword, resetPassword } from '@/shared/lib/supabase';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        
        // Check Supabase connection first
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.error('Unable to connect to Supabase. Check your network connection or Supabase service status.');
          throw new Error('Database connection failed');
        }
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          setUser(currentSession.user);
          
          // Fetch user roles - but don't let it block authentication
          try {
            const { data: rolesData, error: rolesError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentSession.user.id);
              
            if (rolesError) {
              console.error('Error fetching user roles:', rolesError);
              // Set default roles even if there's an error
              setUserRoles([]);
              setIsAdmin(false);
            } else {
              const roles = rolesData?.map(r => r.role) || [];
              setUserRoles(roles);
              setIsAdmin(roles.includes('superadmin'));
            }
          } catch (roleErr) {
            console.error('Exception fetching user roles:', roleErr);
            // Set default roles even if there's an exception
            setUserRoles([]);
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error('Error loading session:', err);
        setSession(null);
        setUser(null);
        setUserRoles([]);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    loadSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          // Fetch user roles on auth state change - but don't let it block authentication
          try {
            const { data: rolesData, error: rolesError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', newSession.user.id);
              
            if (rolesError) {
              console.error('Error fetching user roles on auth change:', rolesError);
              // Set default roles even if there's an error
              setUserRoles([]);
              setIsAdmin(false);
            } else {
              const roles = rolesData?.map(r => r.role) || [];
              setUserRoles(roles);
              setIsAdmin(roles.includes('superadmin'));
            }
          } catch (roleErr) {
            console.error('Exception fetching user roles on auth change:', roleErr);
            // Set default roles even if there's an exception
            setUserRoles([]);
            setIsAdmin(false);
          }
        } else {
          setUserRoles([]);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
    signIn,
    error: null,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    userRoles,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Development bypass for authentication
// This should only be enabled temporarily during development when needed
// and should never be enabled in production
const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true' && import.meta.env.DEV;

// If authentication bypass is needed for development, use this mock user
const DEV_USER = {
  id: 'dev-user-id',
  email: 'dev@example.com',
  user_metadata: { name: 'Development User' },
};

export function useAuth() {
  const context = useContext(AuthContext);
  
  // In development mode, provide a bypass for authentication
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
      isAdmin: false
    };
    
    return {
      ...safeContext,
      // Override sign-in to always succeed in development
      signIn: async (_email, _password, _rememberMe) => ({
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