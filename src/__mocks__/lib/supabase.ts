import { mockSupabaseClient } from '../supabaseMock';

// Export the supabase client as 'supabase'
export const supabase = mockSupabaseClient;

// Session cache mock
export const sessionCache = new WeakMap();

// Auth helper functions
export const signIn = jest.fn();
export const signUp = jest.fn();
export const signOut = jest.fn();
export const forgotPassword = jest.fn();
export const resetPassword = jest.fn();
export const resendConfirmationEmail = jest.fn();
export const refreshSession = jest.fn();
export const checkConnection = jest.fn().mockResolvedValue(true);

// Default export
export default mockSupabaseClient;
