import { supabase } from '@/shared/lib/supabase';

// Define a type for Supabase errors
interface SupabaseError {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Error handling utility
function handleSupabaseError(error: Error | SupabaseError | unknown, context?: string): never {
  const contextMessage = context ? ` while ${context}` : '';
  console.error(`Supabase API Error${contextMessage}:`, error);
  
  // Handle different error types
  if (error instanceof Error) {
    // Check for RLS policy errors and provide a more helpful message
    if (error.message && error.message.includes('infinite recursion detected in policy')) {
      console.warn('This is likely due to circular dependencies in Row Level Security policies.');
      throw new Error(`Database security policy error${contextMessage}. Please contact the administrator.`);
    }
    throw new Error(error.message || `An error occurred${contextMessage}`);
  } else if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    // Handle Supabase error object
    if (error.message.includes('infinite recursion detected in policy')) {
      console.warn('This is likely due to circular dependencies in Row Level Security policies.');
      throw new Error(`Database security policy error${contextMessage}. Please contact the administrator.`);
    }
    throw new Error(error.message || `An error occurred${contextMessage}`);
  }
  
  // Fallback for unknown error types
  throw new Error(`An unknown error occurred${contextMessage}`);
}

export { supabase, handleSupabaseError };
