import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';

// Define the context shape
interface SessionContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create the context with default values
const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  loading: false,
  signOut: async () => {},
});

// Mock session provider component
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock sign out function
  const signOut = async () => {
    setSession(null);
    setUser(null);
  };

  // Expose methods for testing
  (SessionProvider as any).mockSetSession = (newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user || null);
  };

  // Provide the context value
  return (
    <SessionContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </SessionContext.Provider>
  );
};

// Hook to use the session context
export const useSession = () => useContext(SessionContext);

// Export the mock methods for testing
export const mockSessionContext = {
  setSession: (session: Session | null) => {
    (SessionProvider as any).mockSetSession(session);
  }
};

export default SessionContext;
