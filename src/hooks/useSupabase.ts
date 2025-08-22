import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const useSupabase = () => {
  const [supabase] = useState(supabaseClient);
  
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase client not initialized. Check your environment variables.');
    }
  }, [supabase]);
  
  return { supabase };
};