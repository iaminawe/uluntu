import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getSession, signIn, signUp, signOut } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  userRoles: string[];
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        
        // Get the current session
        const { session: currentSession, error: sessionError } = await getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          setUser(currentSession.user);
          
          // Fetch user roles
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentSession.user.id);
            
          if (rolesError) {
            console.error('Error fetching user roles:', rolesError);
          } else {
            const roles = rolesData.map(r => r.role);
            setUserRoles(roles);
            setIsAdmin(roles.includes('superadmin'));
          }
        }
      } catch (err) {
        console.error('Error loading session:', err);
        setError(err as Error);
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
          // Fetch user roles on auth state change
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', newSession.user.id);
            
          if (rolesError) {
            console.error('Error fetching user roles:', rolesError);
          } else {
            const roles = rolesData.map(r => r.role);
            setUserRoles(roles);
            setIsAdmin(roles.includes('superadmin'));
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
    error,
    signIn,
    signUp,
    signOut,
    userRoles,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}