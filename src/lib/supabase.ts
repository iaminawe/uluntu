import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
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