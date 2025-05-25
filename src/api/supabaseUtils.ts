import { supabase } from '../lib/supabase';

// Error handling utility
function handleSupabaseError(error: any): never {
  console.error('Supabase API Error:', error);
  throw new Error(error.message || 'An error occurred while fetching data');
}

export { supabase, handleSupabaseError };
