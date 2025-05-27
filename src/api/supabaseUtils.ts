import { supabase } from '../lib/supabase';

// Error handling utility
function handleSupabaseError(error: any, context?: string): never {
  const contextMessage = context ? ` while ${context}` : '';
  console.error(`Supabase API Error${contextMessage}:`, error);
  throw new Error(error.message || `An error occurred${contextMessage}`);
}

export { supabase, handleSupabaseError };
