import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  // Provide fallback values for development to prevent crashes
  // These won't work for actual API calls but will allow the app to initialize
}

// Create Supabase client with error handling
export const supabase = createClient<Database>(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'fallback-key-for-development-only'
);

// Check Supabase connection status
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to check if we can connect to Supabase
    // Using 'members' table as it should exist in most Supabase instances
    const { error } = await supabase.from('members').select('count').limit(1);
    
    // If there's a permission error, that's still a successful connection
    // We just don't have access to the table
    if (error && !error.message.includes('permission denied')) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    return false;
  }
};

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  try {
    // First check connection to avoid unexpected errors
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      return {
        data: null,
        error: new Error('Unable to connect to authentication service. Please check your network connection.')
      };
    }
    
    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Handle specific error cases
    if (error && error.status === 500 && error.message.includes('unexpected_failure')) {
      console.warn('Encountered unexpected auth failure, attempting fallback authentication...');
      
      // Wait a moment and try again - sometimes this helps with transient errors
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Second attempt
      const secondAttempt = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return secondAttempt;
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error during sign in:', err);
    return {
      data: null,
      error: new Error('An unexpected error occurred during sign in. Please try again later.')
    };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

// Storage helper functions
export const uploadProfileImage = async (file: File, userId: string): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const bucket = import.meta.env.VITE_PROFILE_IMAGES_BUCKET || 'profile-images';
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/profile.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return { url: null, error: error as Error };
  }
};

export const uploadCoverImage = async (file: File, userId: string): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const bucket = import.meta.env.VITE_PROFILE_IMAGES_BUCKET || 'profile-images';
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/cover.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading cover image:', error);
    return { url: null, error: error as Error };
  }
};