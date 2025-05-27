import { Session, User, AuthChangeEvent, Subscription } from '@supabase/supabase-js';

type MockAuthResponse = {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: Error | null;
};

type MockSubscriptionResponse = {
  data: {
    subscription: Subscription;
  };
};

export const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn().mockImplementation((): Promise<MockAuthResponse> => 
      Promise.resolve({ data: { user: null, session: null }, error: null })
    ),
    signUp: jest.fn().mockImplementation((): Promise<MockAuthResponse> => 
      Promise.resolve({ data: { user: null, session: null }, error: null })
    ),
    signOut: jest.fn().mockImplementation((): Promise<{ error: Error | null }> => 
      Promise.resolve({ error: null })
    ),
    resetPasswordForEmail: jest.fn().mockImplementation((): Promise<{ error: Error | null }> => 
      Promise.resolve({ error: null })
    ),
    getSession: jest.fn().mockImplementation((): Promise<{ data: { session: Session | null }, error: Error | null }> => 
      Promise.resolve({ data: { session: null }, error: null })
    ),
    updateUser: jest.fn().mockImplementation((): Promise<{ error: Error | null }> => 
      Promise.resolve({ error: null })
    ),
    onAuthStateChange: jest.fn().mockImplementation(
      (callback: (event: AuthChangeEvent, session: Session | null) => void): MockSubscriptionResponse => {
        return {
          data: {
            subscription: {
              id: 'mock-subscription-id',
              callback,
              unsubscribe: jest.fn()
            } as unknown as Subscription
          }
        };
      }
    ),
    // For session cache testing
    _sessionCache: new Map()
  }
};