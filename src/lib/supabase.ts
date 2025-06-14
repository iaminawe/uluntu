import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { AuthError } from '@supabase/supabase-js';

// Get environment variables with proper validation
// In test environment, check both import.meta.env and process.env
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : null);
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : null);

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is required');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required');
}

// Create Supabase client with validated environment variables
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Check Supabase connection status
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking Supabase connection...');
    // Log the Supabase URL (but not the key for security reasons)
    console.log('Using Supabase URL:', supabaseUrl);
    
    // Simple query to check if we can connect to Supabase
    // Using 'members' table as it should exist in most Supabase instances
    console.log('Attempting to query members table...');
    const { data, error } = await supabase.from('members').select('count').limit(1);
    
    // If there's a permission error, that's still a successful connection
    // We just don't have access to the table
    if (error) {
      console.error('Supabase connection check error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
      if (error.message.includes('permission denied')) {
        console.log('Permission denied, but connection successful');
        return true;
      }
      
      if (error.message.includes('relation "members" does not exist')) {
        console.error('Schema error: "members" table does not exist');
        return false;
      }
      
      return false;
    }
    
    console.log('Supabase connection successful:', data);
    return true;
  } catch (err) {
    console.error('Exception checking Supabase connection:', err);
    if (err instanceof Error) {
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
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

export const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
  try {
    console.log('Starting sign-in process...');
    
    // First check connection to avoid unexpected errors
    console.log('Checking Supabase connection before sign-in...');
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('Supabase connection check failed before sign-in');
      return {
        data: null,
        error: new Error('Unable to connect to authentication service. Please check your network connection.')
      };
    }
    
    console.log('Connection check passed, attempting sign-in...');
    
    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // Set session persistence based on rememberMe
        // 'local' (default) keeps the session until explicitly signed out
        // 'none' clears the session when the browser is closed
        persistSession: rememberMe
      }
    });
    
    // Handle specific error cases
    if (error) {
      console.error('Sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      
      if (error.status === 500 && error.message.includes('unexpected_failure')) {
        console.warn('Encountered unexpected auth failure, attempting fallback authentication...');
        
        // Wait a moment and try again - sometimes this helps with transient errors
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Attempting second sign-in...');
        
        // Second attempt
        const secondAttempt = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (secondAttempt.error) {
          console.error('Second sign-in attempt failed:', secondAttempt.error);
        } else {
          console.log('Second sign-in attempt succeeded');
        }
        
        return secondAttempt;
      }
      if (error.message.includes('schema')) {
        console.error('Database schema error during sign-in:', error);
        // Return a user-friendly error instead of letting the schema error propagate
        return {
          data: null,
          error: new Error('Authentication service encountered a configuration issue. Please try again later.')
        };
      }
      
      return { data, error };
    } else {
      console.log('Sign-in successful');
      return { data, error };
    }
  } catch (err) {
    console.error('Exception during sign in:', err);
    if (err instanceof Error) {
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
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

// Content image upload functions
export const uploadOpportunityImage = async (file: File, opportunityId: string): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const bucket = import.meta.env.VITE_CONTENT_IMAGES_BUCKET || 'content-images';
    const fileExt = file.name.split('.').pop();
    const fileName = `opportunities/${opportunityId}/image.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading opportunity image:', error);
    return { url: null, error: error as Error };
  }
};

export const uploadNewsImage = async (file: File, newsId: string): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const bucket = import.meta.env.VITE_CONTENT_IMAGES_BUCKET || 'content-images';
    const fileExt = file.name.split('.').pop();
    const fileName = `news/${newsId}/featured.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading news image:', error);
    return { url: null, error: error as Error };
  }
};

export const uploadGroupImage = async (file: File, groupId: string, imageType: 'hero' | 'cover'): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const bucket = import.meta.env.VITE_GROUP_IMAGES_BUCKET || 'group-images';
    const fileExt = file.name.split('.').pop();
    const fileName = `${groupId}/${imageType}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error(`Error uploading group ${imageType} image:`, error);
    return { url: null, error: error as Error };
  }
};

export const uploadEventImage = async (file: File, eventId: string): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const bucket = import.meta.env.VITE_CONTENT_IMAGES_BUCKET || 'content-images';
    const fileExt = file.name.split('.').pop();
    const fileName = `events/${eventId}/featured.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading event image:', error);
    return { url: null, error: error as Error };
  }
};

export const uploadDirectoryImage = async (file: File, directoryId: string): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const bucket = import.meta.env.VITE_PROFILE_IMAGES_BUCKET || 'profile-images';
    const fileExt = file.name.split('.').pop();
    const fileName = `directory/${directoryId}/profile.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading directory image:', error);
    return { url: null, error: error as Error };
  }
};

export const uploadBackgroundImage = async (file: File, contentId: string): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const bucket = import.meta.env.VITE_BACKGROUND_IMAGES_BUCKET || 'background-images';
    const fileExt = file.name.split('.').pop();
    const fileName = `${contentId}/background.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading background image:', error);
    return { url: null, error: error as Error };
  }
};

/**
 * Sends a password reset email to the specified email address
 * @param email The email address to send the password reset link to
 * @returns Object containing success status and any error
 */
export const forgotPassword = async (email: string): Promise<{ 
  success: boolean; 
  error: Error | AuthError | null 
}> => {
  try {
    console.log('Initiating password reset for:', email);
    
    // First check connection to avoid unexpected errors
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('Supabase connection check failed before password reset');
      return {
        success: false,
        error: new Error('Unable to connect to authentication service. Please check your network connection.')
      };
    }
    
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Password reset error:', error);
      return { success: false, error };
    }
    
    console.log('Password reset email sent successfully');
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception during password reset:', err);
    return {
      success: false,
      error: err instanceof Error ? err : new Error('An unexpected error occurred')
    };
  }
};

/**
 * Resets the user's password with the new password
 * @param newPassword The new password to set
 * @returns Object containing success status and any error
 */
export const resetPassword = async (newPassword: string): Promise<{ 
  success: boolean; 
  error: Error | AuthError | null 
}> => {
  try {
    console.log('Attempting to update password');
    
    // First check connection to avoid unexpected errors
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('Supabase connection check failed before password update');
      return {
        success: false,
        error: new Error('Unable to connect to authentication service. Please check your network connection.')
      };
    }
    
    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Password update error:', error);
      return { success: false, error };
    }
    
    console.log('Password updated successfully');
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception during password update:', err);
    return {
      success: false,
      error: err instanceof Error ? err : new Error('An unexpected error occurred')
    };
  }
};