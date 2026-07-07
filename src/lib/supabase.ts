import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { AuthError } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

// Get environment variables from Vite's import.meta.env.
// SECURITY: reference ONLY specific properties (import.meta.env.VITE_X). Any
// bare `import.meta.env` reference — even a truthiness guard — makes Vite
// inline the ENTIRE env object into the client bundle, leaking every VITE_*
// secret. Never write bare `import.meta.env`.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Log Supabase configuration for debugging
logger.debug('Supabase configuration loaded', 'SUPABASE', { 
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length
});

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  logger.error('Missing required environment variables', 'SUPABASE', { missingVars });
  
  // Show user-friendly error in the browser
  if (typeof document !== 'undefined' && document.getElementById('root')) {
    document.getElementById('root')!.innerHTML = `
      <div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626; margin-bottom: 16px;">Configuration Error</h1>
        <p style="color: #4b5563; margin-bottom: 24px;">The application is not properly configured. This usually happens when environment variables are not set during the build process.</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="color: #991b1b; margin-top: 0;">Missing Environment Variables:</h3>
          <ul style="color: #7f1d1d; margin: 8px 0;">
            ${missingVars.map(v => `<li>${v}</li>`).join('')}
          </ul>
        </div>
        <details style="margin-top: 24px;">
          <summary style="cursor: pointer; color: #6b7280;">Technical Details for Developers</summary>
          <div style="margin-top: 16px; padding: 16px; background: #f3f4f6; border-radius: 4px;">
            <p style="margin: 0 0 8px 0;"><strong>Build Time Variables Required:</strong></p>
            <pre style="background: #e5e7eb; padding: 12px; border-radius: 4px; overflow-x: auto;">
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here</pre>
            <p style="margin: 16px 0 8px 0;"><strong>Current Values:</strong></p>
            <pre style="background: #e5e7eb; padding: 12px; border-radius: 4px; overflow-x: auto;">
VITE_SUPABASE_URL=${supabaseUrl || 'undefined'}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey ? '[REDACTED]' : 'undefined'}</pre>
            <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">
              These variables must be set as build arguments in your deployment platform (e.g., Coolify, Vercel, Netlify).
            </p>
          </div>
        </details>
      </div>
    `;
  }
  
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Create Supabase client with enhanced session persistence
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Enhanced storage key to avoid conflicts
    storageKey: 'sb-auth-token',
    // Debug mode disabled
    debug: false
  },
  // Global headers for better debugging
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web/2.x'
    }
  }
});

// Log when client is created
logger.info('Supabase client created successfully', 'SUPABASE');

// Supabase client is ready for use
logger.info('Supabase client initialized', 'SUPABASE');

// Cache for session conversions using WeakMap
export const sessionCache = new WeakMap();

// Check Supabase connection status
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    logger.debug('Checking Supabase connection', 'SUPABASE');
    logger.debug('Using Supabase URL', 'SUPABASE', { url: supabaseUrl });
    
    // Simple query to check if we can connect to Supabase
    // Using 'members' table as it should exist in most Supabase instances
    logger.debug('Attempting to query members table', 'SUPABASE');
    const { data, error } = await supabase.from('members').select('count').limit(1);
    
    // If there's a permission error, that's still a successful connection
    // We just don't have access to the table
    if (error) {
      logger.error('Supabase connection check error', 'SUPABASE', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      
      if (error.message.includes('permission denied')) {
        logger.info('Permission denied, but connection successful', 'SUPABASE');
        return true;
      }
      
      if (error.message.includes('relation "members" does not exist')) {
        logger.error('Schema error: "members" table does not exist', 'SUPABASE');
        return false;
      }
      
      return false;
    }
    
    logger.info('Supabase connection successful', 'SUPABASE', data);
    return true;
  } catch (err) {
    logger.error('Exception checking Supabase connection', 'SUPABASE', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
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
    logger.debug('Starting sign-in process', 'AUTH');
    
    // First check connection to avoid unexpected errors
    logger.debug('Checking Supabase connection before sign-in', 'AUTH');
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      logger.error('Supabase connection check failed before sign-in', 'AUTH');
      return {
        data: null,
        error: new Error('Unable to connect to authentication service. Please check your network connection.')
      };
    }
    
    logger.debug('Connection check passed, attempting sign-in', 'AUTH');
    
    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken: undefined // Captcha token if required
      }
    });
    
    // Handle specific error cases
    if (error) {
      logger.error('Sign-in error', 'AUTH', {
        code: error.code,
        message: error.message,
        status: error.status
      });
      
      if (error.status === 500 && error.message.includes('unexpected_failure')) {
        logger.warn('Encountered unexpected auth failure, attempting fallback authentication', 'AUTH');
        
        // Wait a moment and try again - sometimes this helps with transient errors
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        logger.debug('Attempting second sign-in', 'AUTH');
        
        // Second attempt
        const secondAttempt = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (secondAttempt.error) {
          logger.error('Second sign-in attempt failed', 'AUTH', secondAttempt.error);
        } else {
          logger.info('Second sign-in attempt succeeded', 'AUTH');
        }
        
        return secondAttempt;
      }
      if (error.message.includes('schema')) {
        logger.error('Database schema error during sign-in', 'AUTH', error);
        // Return a user-friendly error instead of letting the schema error propagate
        return {
          data: null,
          error: new Error('Authentication service encountered a configuration issue. Please try again later.')
        };
      }
      
      return { data, error };
    } else {
      logger.info('Sign-in successful', 'AUTH');
      return { data, error };
    }
  } catch (err) {
    logger.error('Exception during sign in', 'AUTH', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
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
    logger.error('Error uploading profile image', 'STORAGE', error);
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
    logger.error('Error uploading cover image', 'STORAGE', error);
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
    logger.error('Error uploading opportunity image', 'STORAGE', error);
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
    logger.error('Error uploading news image', 'STORAGE', error);
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
    logger.error(`Error uploading group ${imageType} image`, 'STORAGE', error);
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
    logger.error('Error uploading event image', 'STORAGE', error);
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
    logger.error('Error uploading directory image', 'STORAGE', error);
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
    logger.error('Error uploading background image', 'STORAGE', error);
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
    logger.debug('Initiating password reset', 'AUTH', { email });
    
    // First check connection to avoid unexpected errors
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      logger.error('Supabase connection check failed before password reset', 'AUTH');
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
      logger.error('Password reset error', 'AUTH', error);
      return { success: false, error };
    }
    
    logger.info('Password reset email sent successfully', 'AUTH');
    return { success: true, error: null };
  } catch (err) {
    logger.error('Exception during password reset', 'AUTH', err);
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
    logger.debug('Attempting to update password', 'AUTH');
    
    // First check connection to avoid unexpected errors
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      logger.error('Supabase connection check failed before password update', 'AUTH');
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
      logger.error('Password update error', 'AUTH', error);
      return { success: false, error };
    }
    
    logger.info('Password updated successfully', 'AUTH');
    return { success: true, error: null };
  } catch (err) {
    logger.error('Exception during password update', 'AUTH', err);
    return {
      success: false,
      error: err instanceof Error ? err : new Error('An unexpected error occurred')
    };
  }
};